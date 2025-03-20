import * as fsx from 'fs-extra';
import * as vscode from 'vscode';
import { Settings } from '../Settings';
import { Context, EXIT, InputConfig, UserConfig } from '../types';
import * as caseConverter from './Case';
import { clearLog, log } from './FileTemplate.log';
import {
  getRegexValues,
  getValueFromCallback,
  handleError,
  isPlainObject,
  mergeContext,
  parseInputTransformVariable,
  readFile,
  resolveWithWorkspaceFolder,
  shouldOpenGeneratedFile
} from './utils';
import { interpolate } from './utils/interpolation';
import { getActiveFileDetails, getFSPathDetails, getWorkSpaceFolderDetails } from './utils/pathDetails';
import { getInput } from './utils/prompts';

export default class TemplateUtils {
  context: Context = {} as Context;
  log = log;
  clearLog = clearLog;
  errorMessage: string | undefined;

  constructor(fsPath?: string, allTemplates: string[] = [], selectedTemplates: string[] = []) {
    this.setContext({
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
      ...getWorkSpaceFolderDetails(),
      allTemplates,
      selectedTemplates,
      allTemplateFiles: [],
      allTemplateFileNames: [],
      selectedTemplateFiles: [],
      selectedTemplateFileNames: [],
      overwriteExistingFile: Settings.overwriteExistingFile,
      promptTemplateFiles: Settings.promptTemplateFiles,
      enableSnippetGeneration: Settings.enableSnippetGeneration,
      openAfterGeneration: Settings.openAfterGeneration,
      promptVariablePatterns: Settings.promptVariablePatterns,
      variables: Settings.variables,
      input: Settings.input,
      ...getFSPathDetails(fsPath),
      ...getActiveFileDetails(),
      log: log,
      clearLog: clearLog
    });
    this.#loadPackageJson();
  }

  /**
   * Sets the context by merging the provided context with the existing context.
   * @param {Context} [newContext] - The context to merge.
   */
  setContext(newContext?: Partial<Context>) {
    if (!isPlainObject(newContext) || !Object.keys(newContext).length) return;
    mergeContext(this.context, newContext);
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
   * Prompts the user for input values based on the provided input names.
   * Updates the context with the input values and applies any transformations.
   * @param {string[]} inputNames - The names of the inputs to prompt for.
   * @param {boolean} [isPreLoadInput=false] - Whether the inputs are pre-loaded.
   */
  async _promptInputs(inputNames: string[], isPreLoadInput: boolean = false) {
    if (!inputNames.length) return;
    this.log('Prompting for input values... Time to get some details! ✍️');

    let isPrompted = false;

    for (const inputNameStr of inputNames) {
      const { inputName, transform } = parseInputTransformVariable(inputNameStr, this.context);

      const userInputConfig = this.context.input[inputName];
      const inputConfig = ((await getValueFromCallback(userInputConfig, this.context)) || {}) as InputConfig;

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

      isPrompted = true;

      this.log(`\t Prompting input for "${inputName}"...`);

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

      this.log(`\t Input successfully received for "${inputName}": ${JSON.stringify(value)}`);
    }

    if (!isPrompted) this.log('Nothing was prompted. Looks like we have all the info we need!');
  }

  /**
   * Prompts the user for input values based on the patterns found in the provided data.
   * @param {string} [data=''] - The data to search for input patterns.
   */
  async _promptInputsFromPattern(data: string = '') {
    const promptPatterns = await getValueFromCallback(this.context.promptVariablePatterns, this.context, true);
    const unknownInputs = (promptPatterns.length ? promptPatterns : ['\\$\\{input\\.([^\\}]+)\\}'])
      .map((pattern: string) => getRegexValues(data, pattern))
      .flat();
    return await this._promptInputs(unknownInputs);
  }

  /**
   * Prompts the user for a single input value based on the provided input name and configuration.
   * Updates the context with the input value.
   * @param {string} [inputName] - The name of the input to prompt for.
   * @param {InputConfig} [inputConfig] - The configuration for the input.
   * @returns {Promise<any>} The input value.
   */
  async promptInput(inputName?: string, inputConfig?: InputConfig, context?: Context) {
    this.setContext(context);

    if (!inputName?.trim()) return;
    if (isPlainObject(inputConfig)) {
      this.context.input[inputName] = isPlainObject(this.context.input[inputName])
        ? { ...this.context.input[inputName], ...inputConfig }
        : inputConfig;
    }
    await this._promptInputs([inputName]);
    return this.context[inputName];
  }

  /**
   * Executes the provided hook callback before processing each template file.
   * Updates the context with the result of the callback.
   * @param {UserConfig['beforeEach']} [callback] - The hook callback to execute.
   * @param {string} [hookName] - The name of the hook.
   * @returns {Promise<boolean>} Whether the hook execution was successful.
   */
  async _hooks(callback?: UserConfig['beforeEach'], hookName: string = 'hook') {
    if (!callback) return true;
    this.log(`Executing ${hookName} callback...`, hookName === 'afterAll' ? '\n' : '');
    const newContext = await callback(this.context);
    if (newContext === false) {
      this.log(`[WARNING] ${hookName} callback returned false.`);
      return false;
    }
    if (isPlainObject(newContext) && Object.keys(newContext).length) {
      this.log(`Setting Context...`);
      this.setContext(newContext);
    }
    return true;
  }

  /**
   * Processes the provided data using the hook callback after processing each template file.
   * Updates the context with the result of the callback.
   * @param {string} data - The data to process.
   * @param {UserConfig['processAfterEach']} [callback] - The hook callback to execute.
   * @param {string} [hookName] - The name of the hook.
   * @returns {Promise<string>} The processed data.
   */
  async _processHooks(data: string, callback?: UserConfig['processAfterEach'], hookName: string = 'hook') {
    if (!callback) return data;
    this.log(`Processing data using ${hookName} callback...`);
    const processedObject = await callback({ data, context: this.context });
    if (processedObject === false || (processedObject !== undefined && !isPlainObject(processedObject))) {
      this.log(`[WARNING] ${hookName} callback returned false or invalid data.`);
      return false;
    }
    if (isPlainObject(processedObject?.context) && Object.keys(processedObject?.context).length) {
      this.log(`Setting Context...`);
      this.setContext(processedObject?.context);
    }
    return processedObject?.data || data;
  }

  /**
   * Retrieves and processes template file data.
   *
   * @param templateFile - The path to the template file.
   * @param context - Optional partial context to override the default context.
   * @throws Will throw an error if there is an issue reading or processing the template file.
   */
  async getTemplateFileData(templateFile: string, context?: Partial<Context>) {
    try {
      this.log(`Retrieving template file data for: './${this.context.currentTemplateFile}'`);
      this.setContext(context);

      const shouldRequire = templateFile.endsWith('.template.js');

      let data = await readFile(templateFile, this.context);

      !shouldRequire && (await this._promptInputsFromPattern(data));

      const processedDataBefore = await this._processHooks(data, this.context.processBeforeEach, 'processBeforeEach');
      if (processedDataBefore === false) return false;
      data = processedDataBefore;

      const disableInterpolate = await getValueFromCallback(this.context?.disableInterpolation, this.context);
      const disableInterpolationErrorMessage = await getValueFromCallback(this.context?.disableInterpolationErrorMessage, this.context);

      if (!shouldRequire && !disableInterpolate) {
        const shouldInterpolateByLineByLine = await getValueFromCallback(this.context?.interpolateByLine, this.context);
        this.log(`Interpolating template content...`);
        data = interpolate(String(data), this.context, disableInterpolationErrorMessage, shouldInterpolateByLineByLine);
      }
      const processedDataAfter = await this._processHooks(data, this.context.processAfterEach, 'processAfterEach');
      if (processedDataAfter === false) return false;
      data = processedDataAfter;
      return data;
    } catch (error) {
      this.errorMessage = handleError(error, this.context, this.errorMessage);
      throw error;
    }
  }

  /**
   * Creates an output file with the provided data and handles snippet generation if enabled.
   *
   * @param data - The content to be written to the output file.
   * @param contextOrOutputFile - Either a partial context object or a string representing the output file path.
   * @throws Will throw an error if there is an issue reading or processing the template file.
   */
  async createOutputFile(data: string, contextOrOutputFile?: Partial<Context> | string) {
    try {
      this.setContext(typeof contextOrOutputFile === 'string' ? { outputFile: contextOrOutputFile } : contextOrOutputFile);
      this.log(`Creating output file at: './${this.context.relativeOutputFile}'`);

      await fsx.ensureFile(this.context.outputFile!);

      if (!Boolean(await getValueFromCallback(this.context.enableSnippetGeneration, this.context))) {
        await fsx.writeFile(this.context.outputFile!, data);
        if (await shouldOpenGeneratedFile(this.context)) {
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
      this.log('[SUCCESS] Output file created successfully! Time to celebrate! 🎉');
    } catch (error) {
      this.errorMessage = handleError(error, this.context, this.errorMessage);
      throw error;
    }
  }
}
