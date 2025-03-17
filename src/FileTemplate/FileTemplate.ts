import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Settings } from '../Settings';
import { Context, EXIT } from '../types';
import * as Case from './Case';
import getTemplateConfig from './FileTemplate.Config';
import TemplateUtils from './FileTemplate.Utils';
import { getOutputFilePath, getTimes, getValueFromCallback, handleError, isPlainObject, listNestedFiles, readFile } from './utils';
import { interpolate, interpolateFormat } from './utils/interpolation';
import {
  getOutputFilePathDetails,
  getParsedTemplateFilePathDetails,
  getTemplateFilePathDetails,
  getTemplatePathDetails,
  normalizeSeparator
} from './utils/pathDetails';
import { getTemplateName, selectTemplateFiles, shouldSkipFile } from './utils/prompts';

const exampleTemplatePath = path.resolve(__dirname, '../../Templates');

export class FileTemplate extends TemplateUtils {
  static #fileTemplate: FileTemplate | undefined;

  /**
   * Creates a new instance of `FileTemplate` or returns the existing instance.
   *
   * @param fsPath - The file system path.
   * @param allTemplates - An array of all available templates.
   * @param selectedTemplates - An array of selected templates.
   * @param context - The context in which the template is being created.
   * @param useSeparateInstance - A boolean indicating whether to use a separate instance.
   * @returns The created or existing instance of `FileTemplate`.
   */
  static Create = (
    fsPath?: string,
    allTemplates: string[] = [],
    selectedTemplates: string[] = [],
    context?: Partial<Context>,
    useSeparateInstance: boolean = Settings.useSeparateInstance
  ) => {
    if (!FileTemplate.#fileTemplate || useSeparateInstance) {
      FileTemplate.#fileTemplate = new FileTemplate(fsPath, allTemplates, selectedTemplates, context);
      return FileTemplate.#fileTemplate;
    } else {
      FileTemplate.#fileTemplate?.setContext(context);
      return FileTemplate.#fileTemplate;
    }
  };

  static Destroy = () => {
    FileTemplate.#fileTemplate = undefined;
  };

  constructor(fsPath?: string, allTemplates: string[] = [], selectedTemplates: string[] = [], context?: Partial<Context>) {
    super(fsPath, allTemplates, selectedTemplates);
    this.setContext({
      allTemplateNames: allTemplates.map((t) => path.basename(t)),
      selectedTemplateNames: selectedTemplates.map((t) => path.basename(t)),
      setContext: this.setContext.bind(this),
      promptInput: this.promptInput.bind(this),
      getTemplateFileData: this.getTemplateFileData.bind(this),
      createOutputFile: this.createOutputFile.bind(this),
      generateTemplateFile: this.generateTemplateFile.bind(this),
      generateTemplateFiles: this.generateTemplateFiles.bind(this),
      generateTemplate: this.generateTemplate.bind(this),
      Case,
      readFile,
      interpolate,
      FileTemplate,
      showInformationMessage: vscode.window.showInformationMessage,
      showErrorMessage: vscode.window.showErrorMessage,
      showWarningMessage: vscode.window.showWarningMessage,
      ...context
    });
  }

  /**
   * Asynchronously creates a new template by prompting the user for a template name,
   * ensuring the template directory does not already exist, copying an example template,
   * and opening the new template file in the editor.
   * @throws Will throw an error if the template name is not provided or if an error occurs during the process.
   */
  async createTemplate() {
    try {
      this.log('Prompting for template name...', '\n');
      const templateName = await getTemplateName();
      if (!templateName) throw Error(EXIT);
      const newTemplatePath = path.join(Settings.vscodeTemplatePath, templateName);

      if (fsx.existsSync(newTemplatePath)) {
        this.log('Template already exists.');
        return vscode.window.showErrorMessage('Template already exists.');
      }

      this.log('Creating new template directory...');
      fsx.ensureDirSync(newTemplatePath);
      fsx.copySync(exampleTemplatePath, newTemplatePath);

      const newIndexPath = path.join(newTemplatePath, './variables.jsonc');

      this.log('Opening new template file in editor...');
      const newFile = await vscode.workspace.openTextDocument(newIndexPath);
      await vscode.window.showTextDocument(newFile, undefined, true);

      vscode.window.showInformationMessage(`✨ ${templateName} template has been created successfully! 🎉`);
      this.log(`[SUCCESS] Template '${templateName}' has been created successfully! Time to celebrate! 🎉🎈`);
    } catch (error) {
      this.errorMessage = handleError(error, this.context, this.errorMessage);
      throw error;
    }
    this.log('============================================================================================================', '\n');
  }

  /**
   * Generates a template file based on the provided template file name and context.
   *
   * @param templateFile - The name of the template file to generate.
   * @param context - An optional partial context object to override the default context.
   * @throws Will throw an error if the template file generation fails.
   */
  async generateTemplateFile(templateFile: string, contextOrOutputFile?: Partial<Context> | string) {
    try {
      const context = typeof contextOrOutputFile === 'string' ? { outputFile: contextOrOutputFile } : contextOrOutputFile;
      this.setContext({
        ...context,
        ...getTemplateFilePathDetails(this.context.workspaceFolder, this.context.template!, normalizeSeparator(templateFile))
      });

      this.log(`Generating template file: '${this.context.relativeTemplateFileToTemplate}'...`, '\n');

      if (!(await this._hooks(this.context.beforeEach, 'beforeEach'))) return this.setContext(getOutputFilePathDetails()); // clear outputFile path details

      await this._promptInputsFromPattern(normalizeSeparator(templateFile));

      const parsedTemplateFile = interpolateFormat(normalizeSeparator(templateFile), this.context);
      this.setContext(getParsedTemplateFilePathDetails(this.context.workspaceFolder, this.context.template!, parsedTemplateFile));
      const outputFile = this.context.outputFile || getOutputFilePath(this.context.out, this.context.relativeParsedTemplateFileToTemplate!);

      if (await shouldSkipFile(outputFile, this.context, this.log)) return this.setContext(getOutputFilePathDetails()); // clear outputFile path details

      this.setContext(getOutputFilePathDetails(this.context.workspaceFolder, outputFile));

      const data = await this.getTemplateFileData(normalizeSeparator(templateFile));

      if (data === false) {
        this.log('[WARNING] Template file data retrieval returned false. Exiting...');
        return this.setContext(getOutputFilePathDetails()); // clear outputFile path details
      }

      await this.createOutputFile(data);

      await this._hooks(this.context.afterEach, 'afterEach');

      this.log(`[SUCCESS] Template file generated: '${this.context.relativeTemplateFileToTemplate}'... Woohoo! 🎉`);

      this.setContext(getOutputFilePathDetails()); // clear outputFile path details
    } catch (error) {
      this.setContext(getOutputFilePathDetails()); // clear outputFile path details

      this.errorMessage = handleError(error, this.context, this.errorMessage);
      throw error;
    }
  }

  /**
   * Generates multiple template files based on the provided template file paths and context or output file.
   *
   * @param templateFiles - An array of strings representing the paths to the template files to be generated.
   * @param contextOrOutputFile - An optional parameter that can be either a partial context object or a string representing the output file path.
   * @throws Will throw an error if the generation process fails.
   */
  async generateTemplateFiles(templateFiles: string[], contextOrOutputFile?: Partial<Context> | string) {
    try {
      this.log("Starting generation of multiple template files... Let's do this! 💪");

      const context = typeof contextOrOutputFile === 'string' ? { outputFile: contextOrOutputFile } : contextOrOutputFile;
      this.setContext({
        ...context,
        selectedTemplateFiles: templateFiles,
        selectedTemplateFileNames: templateFiles.map((t) => path.basename(t))
      });

      if (!(await this._hooks(this.context.beforeAll, 'beforeAll'))) return;

      for (let templateFile of templateFiles) {
        await this.generateTemplateFile(normalizeSeparator(templateFile));
      }

      await this._hooks(this.context.afterAll, 'afterAll');
      if (templateFiles.length > 1) {
        this.log('[SUCCESS] Multiple template files generated! You rock! 🎸');
      } else {
        this.log('[SUCCESS] A template file generated! You rock! 🎸');
      }
    } catch (error) {
      this.errorMessage = handleError(error, this.context, this.errorMessage);
      throw error;
    }
  }

  /**
   * Generates a template based on the provided template name and context.
   *
   * @param template - The name of the template to generate.
   * @param context - Optional partial context to override the default context.
   * @throws Will throw an error if no template files are selected or if any other error occurs during the process.
   */
  async generateTemplate(template: string, context?: Partial<Context>) {
    try {
      this.setContext({ ...context, ...getTemplatePathDetails(this.context.workspaceFolder, template) } as Context);

      this.log(`Starting template generation for: '${this.context.templateName}'... Here we go! 🎉`, '\n');

      this.log('Fetching template configuration... Getting things ready! 🛠️');
      const templateConfig = await getTemplateConfig(template, Settings.configPath, this.context);
      this.setContext(templateConfig as Context);

      const outFolder = this.context.fsPathFolder || this.context.workspaceFolder;
      this.context.out = normalizeSeparator(path.resolve(outFolder, interpolateFormat(this.context.out, this.context) || outFolder));

      await this._promptInputs(Object.keys(this.context.input), true);

      this.log("Listing all template files... Let's see what we have here! 📂");
      const allTemplateFiles = await listNestedFiles(
        template,
        [
          `${template}/_config`,
          `${template}/_config.json`,
          `${template}/_config.js`,
          Settings.configPath,
          ...(await getValueFromCallback(this.context.exclude, this.context, true))
        ],
        await getValueFromCallback(this.context.include, this.context, true)
      );
      this.context.allTemplateFiles = allTemplateFiles;
      this.context.allTemplateFileNames = allTemplateFiles.map((t) => path.basename(t));

      this.log('Selecting template files... Making some choices! ✅');
      const selectedTemplateFiles = await selectTemplateFiles(allTemplateFiles, template, this.context);
      if (!selectedTemplateFiles?.length) {
        this.log('[EXIT] No template files selected. Exiting...');
        throw Error(EXIT);
      }
      const templateFiles = selectedTemplateFiles.map((templateFile) => templateFile.value);

      this.log('Generating template files... Almost there! 🛠️');

      const isTimesDefined = this.context.times !== undefined;
      const times = await getTimes(this.context);

      if (isTimesDefined && times.length === 0) {
        this.log('[WARNING] No times provided for template generation. Exiting...');
        vscode.window.showWarningMessage('No times provided for template generation.');
        return;
      }

      for (let [index, time] of times.entries()) {
        const newContext = await getValueFromCallback(time, this.context);
        if (newContext === false) {
          this.log(`[SKIP] Skipping iteration ${index + 1} due to false context...`, '\n');
          continue;
        }

        if (isPlainObject(newContext)) {
          this.log(`Setting new context...`);
          this.setContext(newContext);
        }

        this.log(`Generating template files for times: ${index + 1}/${times.length}...`, '\n');
        await this.generateTemplateFiles(templateFiles);
        this.log('----------------------------------------', '\n');
      }

      if (!isTimesDefined) await this.generateTemplateFiles(templateFiles);

      this.log(`[SUCCESS] Template generation completed for: '${this.context.templateName}'... High five! ✋`, '\n');
      vscode.window.showInformationMessage(`✨ ${this.context.templateName} templates have been generated successfully! 🎉`);
    } catch (error) {
      this.setContext(getTemplatePathDetails()); // clear template details;
      this.errorMessage = handleError(error, this.context, this.errorMessage);
      throw error;
    }
    this.log('================================================================================', '\n', false);
  }
}
