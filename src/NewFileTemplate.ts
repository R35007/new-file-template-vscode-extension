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
  getListFromCallback,
  getOutputFilePath,
  getTemplateData,
  interpolate,
  isPlainObject,
  listNestedFiles,
  mergeContext,
  parseInputTransformVariable,
  resolveWithWorkspaceFolder,
  shouldExit,
  shouldOpenGeneratedFile
} from './utils';
import { getTemplateConfig } from './getTemplateConfig';

const exampleTemplatePath = path.resolve(__dirname, '../Templates');

export class NewTemplates {
  context: Context;
  skippedFiles = {} as Record<string, string[]>;

  constructor() {
    this.context = {
      ...caseConverter,
      __dirname,
      __filename,
      process,
      env: process.env,
      userHome: process.env?.HOME,
      package: {},
      include: [],
      exclude: [],
      inputValues: {},
      out: getWorkSpaceFolder(),
      ...getWorkSpaceFolderDetails(),
      overwriteExistingFile: Settings.overwriteExistingFile,
      promptTemplateFiles: Settings.promptTemplateFiles,
      interpolateTemplateContent: Settings.interpolateTemplateContent,
      enableSnippetGeneration: Settings.enableSnippetGeneration,
      openAfterGeneration: Settings.openAfterGeneration,
      variables: Settings.variables || {},
      input: Settings.input || {},
      promptInput: this.#promptInput.bind(this),
      case: caseConverter
    };
    this.#loadPackageJson();
  }

  #loadPackageJson() {
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
    for (const inputNameStr of inputNames) {
      const { inputName, transform } = parseInputTransformVariable(inputNameStr, this.context);

      const userInputConfig = this.context.input[inputName];
      const inputConfig = ((typeof userInputConfig === 'function' ? userInputConfig(this.context) : userInputConfig) || {}) as InputConfig;

      const inputValue = (this.context.inputValues[inputName] || (isPlainObject(inputConfig) ? undefined : inputConfig)) as unknown;

      const shouldPrePrompt =
        !!inputConfig.prePrompt &&
        (typeof inputConfig.prePrompt === 'function' ? inputConfig.prePrompt(this.context) : !!inputConfig.prePrompt);

      const shouldPrompt = (inputValue === undefined && isPreLoadInput && shouldPrePrompt) || (inputValue === undefined && !isPreLoadInput);

      if (inputValue !== undefined && transform) {
        this.context.inputValues[inputNameStr] = transform(inputValue as string);
        this.context.input[inputNameStr] = transform(inputValue as string);
        this.context[inputNameStr] = transform(inputValue as string);
      }

      if (!shouldPrompt) continue;

      const value = await getInput(inputName, inputConfig, this.context, transform);
      if (value === undefined) throw Error(EXIT); // Don't proceed if user exits
      this.context.inputValues[inputName] = value;
      this.context.input[inputName] = value;
      this.context[inputName] = value;

      if (transform) {
        this.context.inputValues[inputNameStr] = value;
        this.context.input[inputNameStr] = value;
        this.context[inputNameStr] = value;
      }
    }
  }

  async #promptInput(inputName?: string, inputConfig?: InputConfig) {
    if (!inputName?.trim()) return;
    if (isPlainObject(inputConfig)) {
      this.context.input[inputName] = isPlainObject(this.context.input[inputName])
        ? { ...this.context.input[inputName], ...inputConfig }
        : inputConfig;
    }
    await this.#promptInputs([inputName]);
    return this.context[inputName];
  }

  async #promptInputsFromPattern(data: string = '') {
    const pattern = /\$\{input\.[^}]*\}/g;
    const matches = Array.from(new Set(String(data).match(pattern)));
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

  async #getData(templateFile: string) {
    const shouldRequire = path.basename(templateFile).endsWith('.template.js');
    let data = await getTemplateData(templateFile, this.context);
    await this.#promptInputsFromPattern(data);
    data = await this.#processHooks(data, this.context.processBeforeEach);
    data = shouldRequire && !this.context.interpolateTemplateContent ? data : await interpolate(String(data), this.context, shouldRequire);
    data = await this.#processHooks(data, this.context.processAfterEach);
    return data;
  }

  async #createOutputFile(data: string) {
    await fsx.ensureFile(this.context.outputFile!);

    if (!this.context.enableSnippetGeneration) {
      await fsx.writeFile(this.context.outputFile!, data);
      if (shouldOpenGeneratedFile(this.context)) {
        const newFile = await vscode.workspace.openTextDocument(this.context.outputFile!);
        await vscode.window.showTextDocument(newFile, undefined, false);
      }
    } else {
      const newFile = await vscode.workspace.openTextDocument(this.context.outputFile!);
      const editor = await vscode.window.showTextDocument(newFile, undefined, false);

      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(newFile.lineCount, 0));

      edit.delete(newFile.uri, fullRange);
      edit.insert(newFile.uri, new vscode.Position(0, 0), '');
      await vscode.workspace.applyEdit(edit);

      const snippet = new vscode.SnippetString(data);
      await editor.insertSnippet(snippet);
      await newFile.save();
    }
  }

  async #generateTemplateFile(templateFile: string) {
    this.context = { ...this.context, ...getTemplateFilePathDetails(this.context.workspaceFolder, templateFile) };
    this.context.currentTemplateFile = templateFile;

    if (!(await this.#hooks(this.context.beforeEach))) return;

    await this.#promptInputsFromPattern(templateFile);

    const parsedTemplatePaths = interpolate(templateFile, this.context);
    let outputFile = getOutputFilePath(this.context.template!, this.context.out, parsedTemplatePaths);

    const templateFileIndex = this.context.templateFiles?.indexOf(templateFile);
    if (await shouldSkipFile(outputFile, this.context, templateFileIndex))
      return this.skippedFiles[this.context.templateName!].push(path.basename(templateFile));

    this.context = { ...this.context, ...getOutputFilePathDetails(this.context.workspaceFolder, outputFile) };

    const data = await this.#getData(templateFile);

    await this.#createOutputFile(data);

    await this.#hooks(this.context.afterEach);
  }

  async #generateTemplateFiles(templateFiles: string[]) {
    this.context.templateFiles = templateFiles;
    const templateName = this.context.templateName as string;
    this.skippedFiles[templateName] = [];

    if (!(await this.#hooks(this.context.beforeAll))) return;

    for (let templateFile of templateFiles) {
      try {
        await this.#generateTemplateFile(templateFile);
      } catch (err) {
        this.skippedFiles[this.context.templateName!].push(path.basename(templateFile));
        if (shouldExit(err, this.context.currentTemplateFile)) throw Error(EXIT);
      }
    }

    await this.#hooks(this.context.afterAll);

    if (this.skippedFiles[templateName].length >= templateFiles.length)
      return vscode.window.showErrorMessage(`No files have been generated from the ${templateName} template.`);

    if (this.skippedFiles[templateName].length > 0)
      vscode.window.showWarningMessage(`Some template files were skipped: ${this.skippedFiles[templateName].join(',\n')}`);

    vscode.window.showInformationMessage(`✨ ${templateName} templates have been generated successfully! 🎉`);
  }

  async generateTemplate(args: any, template: string, allTemplates: string[], templates: string[]) {
    this.context = {
      ...this.context,
      allTemplates,
      templates,
      ...getFSPathDetails(args?.fsPath),
      ...getActiveFileDetails(),
      ...getTemplatePathDetails(this.context.workspaceFolder, template)
    };

    const templateConfig = await getTemplateConfig(template, Settings.configPath, this.context);
    this.context = mergeContext(this.context, templateConfig);

    const fsPathFolder = this.context.folder || this.context.workspaceFolder;
    this.context.out = path.resolve(fsPathFolder, interpolate(this.context.out, this.context) || fsPathFolder).replace(/\\/g, '/');

    await this.#promptInputs(Object.keys(this.context.input), true);

    const allTemplateFiles = await listNestedFiles(
      template,
      [
        `${template}/_config`,
        `${template}/_config.json`,
        `${template}/_config.js`,
        Settings.configPath,
        ...getListFromCallback(this.context.exclude, this.context)
      ],
      getListFromCallback(this.context.include, this.context)
    );
    this.context.allTemplateFiles = allTemplateFiles;

    const selectedTemplateFiles = await selectTemplateFiles(allTemplateFiles, template, this.context);
    if (!selectedTemplateFiles?.length) throw Error(EXIT);
    const templateFiles = selectedTemplateFiles.map((templateFile) => templateFile.value);

    await this.#generateTemplateFiles(templateFiles);
  }
}
