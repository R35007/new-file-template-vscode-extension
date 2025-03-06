import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Settings } from './Settings';
import * as caseConverter from './caseConverter';
import { getInput, getTemplateName, pickTemplateFolders, selectTemplateFiles, shouldSkipFile } from './inputs';
import {
  getActiveFileDetails,
  getFSPathDetails,
  getOutputFilePathDetails,
  getTemplateFilePathDetails,
  getTemplatePathDetails,
  getWorkSpaceFolder,
  getWorkSpaceFolderDetails
} from './pathDetails';
import { Commands, Context, EXIT, InputConfig, UserConfig } from './types';
import {
  getExcludes,
  getIncludes,
  getOutputFilePath,
  getTemplateConfig,
  getTemplateData,
  getTopLevelFolders,
  interpolate,
  isPlainObject,
  listNestedFiles,
  mergeContext,
  resolveWithWorkspaceFolder,
  shouldExit
} from './utils';

const exampleTemplatePath = path.resolve(__dirname, '../Templates');

export class NewTemplates {
  context: Context;

  constructor() {
    this.context = {
      ...caseConverter,
      __dirname,
      __filename,
      process,
      env: process.env,
      userHome: process.env?.HOME,
      package: {},
      exclude: [],
      include: [],
      out: getWorkSpaceFolder(),
      ...getWorkSpaceFolderDetails(),
      variables: Settings.variables || {},
      promptTemplateFiles: Settings.promptTemplateFiles,
      input: Settings.input || {},
      inputValues: {}
    };
    try {
      const packageJsonPath = resolveWithWorkspaceFolder('./package.json');
      if (Object.keys(this.context.package).length || !fsx.existsSync(packageJsonPath)) return;
      const packageJson = JSON.parse(fsx.readFileSync(packageJsonPath, 'utf-8'));
      this.context.package = packageJson;
    } catch {
      /* do nothing on error */
    }
  }

  async createTemplate() {
    try {
      const templateName = await getTemplateName();
      if (!templateName) return;
      const newTemplatePath = path.join(Settings.vscodeTemplatePath, templateName);

      if (fsx.existsSync(newTemplatePath)) return vscode.window.showErrorMessage('Template already exists.');

      fsx.ensureDirSync(newTemplatePath);
      fsx.copySync(exampleTemplatePath, newTemplatePath);

      const newIndexPath = path.join(newTemplatePath, './extension-predefined-variables.md');

      const newFile = await vscode.workspace.openTextDocument(newIndexPath);
      await vscode.window.showTextDocument(newFile, undefined, true);

      vscode.window.showInformationMessage(`✨ ${templateName} template has been created successfully! 🎉`);
    } catch (err: unknown) {
      if (shouldExit(err)) return;
    }
  }

  async #promptInputs(inputNames: string[], isPreLoadInput: boolean = false) {
    for (const inputName of inputNames) {
      const inputConfig = (this.context.input[inputName] || {}) as InputConfig;

      // Skip if value is already present
      if (this.context.inputValues[inputName as keyof InputConfig] !== undefined || !isPlainObject(inputConfig)) continue;

      if (!isPreLoadInput || !Object.keys(inputConfig).length || inputConfig.promptAlways || inputConfig.when?.(this.context) !== false) {
        const value = await getInput(inputName, inputConfig, this.context);

        if (value === undefined) throw Error(EXIT); // Don't proceed if user exits

        this.context.inputValues[inputName] = value;
        this.context.input[inputName] = value;
        this.context[inputName] = value;
      }
    }
  }

  async #promptInputsFromPattern(data: string = '') {
    // pattern to match ${input.<any string here>}
    const pattern = /\$\{input\.[^}]*\}/g;
    const matches = Array.from(new Set(String(data).match(pattern)));

    // Extract user-defined variables. eg: ${input.componentName} -> componentName
    const unknownInputs = matches.map((match) => match.slice(8, -1)?.trim());

    return await this.#promptInputs(unknownInputs);
  }

  async #hooks(callback?: UserConfig['beforeEach']) {
    if (!callback) return true;
    const context = await callback(this.context);
    if (context === false) return false;
    this.context = mergeContext(this.context, context as Context);
    return true;
  }

  async #processHooks(data: string, callback?: UserConfig['processAfterEach']) {
    if (!callback) return data;
    const processedObject = await callback({ data, context: this.context });
    if (processedObject === false || (processedObject !== undefined && !isPlainObject(processedObject))) return data;
    const processedData = processedObject?.data || data;
    this.context = mergeContext(this.context, processedObject?.context as Context);
    return processedData;
  }

  async #generateTemplateFile(templateFile: string) {
    this.context = { ...this.context, ...getTemplateFilePathDetails(this.context.workspaceFolder, templateFile) };
    this.context.currentTemplateFile = templateFile;

    if (!(await this.#hooks(this.context.beforeEach))) return;

    await this.#promptInputsFromPattern(templateFile);

    const parsedTemplatePaths = interpolate(templateFile, this.context);
    let outputFile = getOutputFilePath(this.context.template!, this.context.out, parsedTemplatePaths);

    if (await shouldSkipFile(outputFile)) return;

    this.context = { ...this.context, ...getOutputFilePathDetails(this.context.workspaceFolder, outputFile) };

    let data = await getTemplateData(templateFile, this.context);

    await this.#promptInputsFromPattern(data);

    data = await this.#processHooks(data, this.context.processBeforeEach);
    data = await interpolate(String(data), this.context);
    data = await this.#processHooks(data, this.context.processAfterEach);

    // write output file
    fsx.ensureFileSync(this.context.outputFile!);
    fsx.writeFileSync(this.context.outputFile!, data);

    // open generated file
    const newFile = await vscode.workspace.openTextDocument(this.context.outputFile!);
    await vscode.window.showTextDocument(newFile, undefined, true);

    await this.#hooks(this.context.afterEach);
  }

  async #generateTemplateFiles(templateFiles: string[]) {
    this.context.templateFiles = templateFiles;

    if (!(await this.#hooks(this.context.beforeAll))) return;

    for (let templateFile of templateFiles) {
      try {
        await this.#generateTemplateFile(templateFile);
      } catch (err) {
        if (shouldExit(err, this.context.currentTemplateFile)) throw Error(EXIT);
      }
    }

    await this.#hooks(this.context.afterAll);
  }
  async #generateTemplate(_args: any, template: string) {
    const templateConfig = await getTemplateConfig(template, Settings.configName, this.context);
    this.context = mergeContext(this.context, templateConfig);
    this.context = {
      ...this.context,
      ...getTemplatePathDetails(this.context.workspaceFolder, template)
    };

    const fsPathFolder = this.context.folder || this.context.workspaceFolder;
    this.context.out = path.resolve(fsPathFolder, interpolate(this.context.out, this.context) || fsPathFolder).replace(/\\/g, '/');

    await this.#promptInputs(Object.keys(this.context.input), true);

    const allTemplateFiles = await listNestedFiles(
      template,
      [
        `${template}/${Settings.configName}`,
        `${template}/${Settings.configName}.json`,
        `${template}/${Settings.configName}.js`,
        ...getExcludes(this.context)
      ],
      getIncludes(this.context)
    );
    this.context.allTemplateFiles = allTemplateFiles;

    const selectedTemplateFiles = await selectTemplateFiles(allTemplateFiles, template, this.context);
    if (!selectedTemplateFiles?.length) throw Error(EXIT);
    const templateFiles = selectedTemplateFiles.map((templateFile) => templateFile.value);

    await this.#generateTemplateFiles(templateFiles);

    vscode.window.showInformationMessage(`✨ ${this.context.templateName} templates have been generated successfully! 🎉`);
  }

  async generateTemplates(args: any) {
    try {
      this.context = {
        ...this.context,
        ...getFSPathDetails(args?.fsPath),
        ...getActiveFileDetails()
      };

      const allTemplates = await getTopLevelFolders(Settings.templatePaths);
      if (!allTemplates?.length) {
        const selectedAction = await vscode.window.showErrorMessage(
          `No templates found. Would you like to create a new sample template in ./.vscode/templates?`,
          { modal: true },
          'Yes'
        );

        if (selectedAction === 'Yes') vscode.commands.executeCommand(Commands.CREATE_SAMPLE_TEMPLATE);
        throw Error(EXIT);
      }
      this.context.allTemplates = allTemplates;

      const selectedTemplates = await pickTemplateFolders(allTemplates);
      if (!selectedTemplates?.length) throw Error(EXIT);
      this.context.templates = selectedTemplates.map((template) => template.value);

      for (const template of this.context.templates) {
        try {
          await this.#generateTemplate(args, template);
        } catch (err) {
          if (shouldExit(err, this.context.currentTemplateFile)) throw Error(EXIT);
        }
      }
    } catch (err) {
      if (shouldExit(err, this.context.currentTemplateFile)) return;
    }
  }
}
