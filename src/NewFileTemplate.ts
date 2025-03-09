import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Settings } from './Settings';
import * as caseConverter from './caseConverter';
import { getTemplateConfig } from './getTemplateConfig';
import { getInput, getTemplateName, selectTemplateFiles, shouldSkipFile } from './inputs';
import {
  getActiveFileDetails,
  getFSPathDetails,
  getOutputFilePathDetails,
  getTemplateFilePathDetails,
  getTemplatePathDetails,
  getWorkSpaceFolder,
  getWorkSpaceFolderDetails
} from './pathDetails';
import { Context, EXIT, InputConfig, UserConfig } from './types';
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

const exampleTemplatePath = path.resolve(__dirname, '../Templates');

export class FileTemplate {
  context: Context;

  constructor(fsPath?: string, allTemplates: string[] = [], selectedTemplates: string[] = [], context?: Context) {
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
      ...getFSPathDetails(fsPath),
      ...getActiveFileDetails(),
      allTemplates,
      selectedTemplates,
      allTemplateNames: allTemplates.map((t) => path.basename(t)),
      selectedTemplateNames: selectedTemplates.map((t) => path.basename(t)),
      setContext: this.setContext.bind(this),
      promptInput: this.promptInput.bind(this),
      getTemplateFileData: this.getTemplateFileData.bind(this),
      createOutputFile: this.createOutputFile.bind(this),
      generateTemplateFile: this.generateTemplateFile.bind(this),
      generateTemplateFiles: this.generateTemplateFiles.bind(this),
      generateTemplate: this.generateTemplate.bind(this),
      Case: caseConverter,
      FileTemplate
    };
    this.setContext(context);
    this.#loadPackageJson();
  }

  /**
   * Sets the context by merging the provided context with the existing context.
   * @param {Context} [context] - The context to merge.
   */
  setContext(context?: Context) {
    this.context = mergeContext(this.context, context);
  }

  /**
   * Loads the package.json file from the workspace folder and sets it in the context.
   * If the package.json file does not exist or an error occurs, it does nothing.
   */
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

  /**
   * Creates a new template by copying the example template to a new location.
   * Prompts the user for the template name and shows an error message if the template already exists.
   * Opens the new template file in the editor and shows a success message.
   */
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

  /**
   * Prompts the user for input values based on the provided input names.
   * Updates the context with the input values and applies any transformations.
   * @param {string[]} inputNames - The names of the inputs to prompt for.
   * @param {boolean} [isPreLoadInput=false] - Whether the inputs are pre-loaded.
   */
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

  /**
   * Prompts the user for a single input value based on the provided input name and configuration.
   * Updates the context with the input value.
   * @param {string} [inputName] - The name of the input to prompt for.
   * @param {InputConfig} [inputConfig] - The configuration for the input.
   * @returns {Promise<any>} The input value.
   */
  async promptInput(inputName?: string, inputConfig?: InputConfig) {
    if (!inputName?.trim()) return;
    if (isPlainObject(inputConfig)) {
      this.context.input[inputName] = isPlainObject(this.context.input[inputName])
        ? { ...this.context.input[inputName], ...inputConfig }
        : inputConfig;
    }
    await this.#promptInputs([inputName]);
    return this.context[inputName];
  }

  /**
   * Prompts the user for input values based on the patterns found in the provided data.
   * @param {string} [data=''] - The data to search for input patterns.
   */
  async #promptInputsFromPattern(data: string = '') {
    const pattern = /\$\{input\.[^}]*\}/g;
    const matches = Array.from(new Set(String(data).match(pattern)));
    const unknownInputs = matches.map((match) => match.slice(8, -1)?.trim());
    return await this.#promptInputs(unknownInputs);
  }

  /**
   * Executes the provided hook callback before processing each template file.
   * Updates the context with the result of the callback.
   * @param {UserConfig['beforeEach']} [callback] - The hook callback to execute.
   * @returns {Promise<boolean>} Whether the hook execution was successful.
   */
  async #hooks(callback?: UserConfig['beforeEach']) {
    if (!callback) return true;
    const context = await callback(this.context);
    if (context === false) return false;
    this.setContext(context as Context);
    return true;
  }

  /**
   * Processes the provided data using the hook callback after processing each template file.
   * Updates the context with the result of the callback.
   * @param {string} data - The data to process.
   * @param {UserConfig['processAfterEach']} [callback] - The hook callback to execute.
   * @returns {Promise<string>} The processed data.
   */
  async #processHooks(data: string, callback?: UserConfig['processAfterEach']) {
    if (!callback) return data;
    const processedObject = await callback({ data, context: this.context });
    if (processedObject === false || (processedObject !== undefined && !isPlainObject(processedObject))) return data;
    const processedData = processedObject?.data || data;
    this.setContext(processedObject?.context as Context);
    return processedData;
  }

  /**
   * Retrieves the template file data and processes it using the context and hooks.
   * Prompts the user for input values based on the patterns found in the template file.
   * @param {string} templateFile - The path to the template file.
   * @returns {Promise<string>} The processed template file data.
   */
  async getTemplateFileData(templateFile: string) {
    const shouldRequire = path.basename(templateFile).endsWith('.template.js');
    let data = await getTemplateData(templateFile, this.context);
    await this.#promptInputsFromPattern(data);
    data = await this.#processHooks(data, this.context.processBeforeEach);
    data = shouldRequire && !this.context.interpolateTemplateContent ? data : await interpolate(String(data), this.context, shouldRequire);
    data = await this.#processHooks(data, this.context.processAfterEach);
    return data;
  }

  /**
   * Creates an output file with the provided data and context.
   * If snippet generation is enabled, inserts the data as a snippet in the editor.
   * @param {string} data - The data to write to the output file.
   * @param {Context} context - The context for the output file.
   */
  async createOutputFile(data: string, context: Context) {
    await fsx.ensureFile(context.outputFile!);

    const enableSnippetGeneration =
      typeof context.enableSnippetGeneration === 'function' ? context.enableSnippetGeneration(context) : context.enableSnippetGeneration;

    if (!enableSnippetGeneration) {
      await fsx.writeFile(context.outputFile!, data);
      if (shouldOpenGeneratedFile(context)) {
        const newFile = await vscode.workspace.openTextDocument(context.outputFile!);
        await vscode.window.showTextDocument(newFile, undefined, false);
      }
    } else {
      const newFile = await vscode.workspace.openTextDocument(context.outputFile!);
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

  /**
   * Generates a template file by processing the template file data and creating the output file.
   * Executes hooks before and after processing the template file.
   * @param {string} templateFile - The path to the template file.
   */
  async generateTemplateFile(templateFile: string) {
    this.setContext({ ...getTemplateFilePathDetails(this.context.workspaceFolder, this.context.template!, templateFile) } as Context);
    this.context.currentTemplateFile = templateFile;

    if (!(await this.#hooks(this.context.beforeEach))) return;

    await this.#promptInputsFromPattern(templateFile);

    const parsedTemplatePaths = interpolate(templateFile, this.context);
    let outputFile = getOutputFilePath(this.context.template!, this.context.out, parsedTemplatePaths);

    const templateFileIndex = this.context.selectedTemplateFiles?.indexOf(templateFile);
    if (await shouldSkipFile(outputFile, this.context, templateFileIndex)) return;

    this.setContext(getOutputFilePathDetails(this.context.workspaceFolder, outputFile) as Context);

    const data = await this.getTemplateFileData(templateFile);

    await this.createOutputFile(data, this.context);

    await this.#hooks(this.context.afterEach);
  }

  /**
   * Generates multiple template files by processing each template file and creating the output files.
   * Executes hooks before and after processing all template files.
   * @param {string[]} templateFiles - The paths to the template files.
   */
  async generateTemplateFiles(templateFiles: string[]) {
    this.context.selectedTemplateFiles = templateFiles;
    this.context.selectedTemplateFileNames = templateFiles.map((t) => path.basename(t));

    const templateName = this.context.templateName as string;

    if (!(await this.#hooks(this.context.beforeAll))) return;

    for (let templateFile of templateFiles) {
      try {
        await this.generateTemplateFile(templateFile);
      } catch (err) {
        if (shouldExit(err, this.context)) throw Error(EXIT);
      }
    }

    await this.#hooks(this.context.afterAll);

    vscode.window.showInformationMessage(`✨ ${templateName} templates have been generated successfully! 🎉`);
  }

  /**
   * Generates a template by processing the template configuration and files.
   * Prompts the user for input values and generates the output files.
   * @param {string} template - The path to the template.
   */
  async generateTemplate(template: string) {
    this.setContext(getTemplatePathDetails(this.context.workspaceFolder, template) as Context);
    const templateConfig = await getTemplateConfig(template, Settings.configPath, this.context);
    this.setContext(templateConfig as Context);

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
    this.context.allTemplateFileNames = allTemplateFiles.map((t) => path.basename(t));

    const selectedTemplateFiles = await selectTemplateFiles(allTemplateFiles, template, this.context);
    if (!selectedTemplateFiles?.length) throw Error(EXIT);
    const templateFiles = selectedTemplateFiles.map((templateFile) => templateFile.value);

    await this.generateTemplateFiles(templateFiles);
  }
}
