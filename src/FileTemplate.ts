import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Settings } from './Settings';
import { TemplateUtils } from './TemplateUtils';
import * as caseConverter from './caseConverter';
import { getTemplateConfig } from './getTemplateConfig';
import { getTemplateName, selectTemplateFiles, shouldSkipFile } from './inputs';
import { getOutputFilePathDetails, getTemplateFilePathDetails, getTemplatePathDetails } from './pathDetails';
import { Context, EXIT } from './types';
import { getOutputFilePath, getValueFromCallback, interpolate, listNestedFiles, shouldExit } from './utils';

const exampleTemplatePath = path.resolve(__dirname, '../Templates');

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
    FileTemplate.#fileTemplate?.clearLog();
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
      Case: caseConverter,
      FileTemplate,
      ...context
    });
  }

  /**
   * Creates a new template by copying the example template to a new location.
   * Prompts the user for the template name and shows an error message if the template already exists.
   * Opens the new template file in the editor and shows a success message.
   */
  async createTemplate() {
    try {
      this.log('Prompting for template name...');
      const templateName = await getTemplateName();
      if (!templateName) return;
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
      this.log(`[SUCCESS] Template ${templateName} has been created successfully! Time to celebrate! 🎉🎈`);
    } catch (err: unknown) {
      if (shouldExit(err, undefined, this.log)) return;
    }
  }

  /**
   * Generates a template file by processing the template file data and creating the output file.
   * Executes hooks before and after processing the template file.
   * @param {string} templateFile - The path to the template file.
   * @param {Context} [newContext] - The context to merge.
   */
  async generateTemplateFile(templateFile: string, context?: Context) {
    this.setContext({
      ...context,
      ...getTemplateFilePathDetails(this.context.workspaceFolder, this.context.template!, templateFile)
    } as Context);

    this.log(`Generating template file: '${this.context.relativeTemplateFile}'...`, '\n');

    if (!(await this._hooks(this.context.beforeEach, 'beforeEach'))) return;

    await this._promptInputsFromPattern(templateFile);

    const parsedTemplatePaths = interpolate(templateFile, this.context);
    let outputFile = getOutputFilePath(this.context.template!, this.context.out, parsedTemplatePaths);

    const templateFileIndex = this.context.selectedTemplateFiles?.indexOf(templateFile);
    if (await shouldSkipFile(outputFile, this.context, templateFileIndex, this.log)) return;

    this.setContext(getOutputFilePathDetails(this.context.workspaceFolder, outputFile) as Context);

    const data = await this.getTemplateFileData(templateFile);

    if (data === false) {
      this.log('[WARNING] Template file data retrieval returned false. Exiting...');
      return;
    }

    await this.createOutputFile(data);

    await this._hooks(this.context.afterEach, 'afterEach');
    this.log(`[SUCCESS] Template file generated: '${this.context.relativeTemplateFile}'... Woohoo! 🎉`);
  }

  /**
   * Generates multiple template files by processing each template file and creating the output files.
   * Executes hooks before and after processing all template files.
   * @param {string[]} templateFiles - The paths to the template files.
   * @param {Context} [newContext] - The context to merge.
   */
  async generateTemplateFiles(templateFiles: string[], context?: Context) {
    this.log("Starting generation of multiple template files... Let's do this! 💪");
    this.setContext({
      ...context,
      selectedTemplateFiles: templateFiles,
      selectedTemplateFileNames: templateFiles.map((t) => path.basename(t))
    } as Context);

    if (!(await this._hooks(this.context.beforeAll, 'beforeAll'))) return;

    for (let templateFile of templateFiles) {
      try {
        await this.generateTemplateFile(templateFile);
      } catch (err) {
        if (shouldExit(err, this.context, this.log)) throw Error(EXIT);
      }
    }

    await this._hooks(this.context.afterAll, 'afterAll');
    if (templateFiles.length > 1) {
      this.log('[SUCCESS] Multiple template files generated! You rock! 🎸');
    } else {
      this.log('[SUCCESS] A template file generated! You rock! 🎸');
    }
  }

  /**
   * Generates a template by processing the template configuration and files.
   * Prompts the user for input values and generates the output files.
   * @param {string} template - The path to the template.
   * @param {Context} [newContext] - The context to merge.
   */
  async generateTemplate(template: string, context?: Context) {
    try {
      this.setContext({ ...context, ...getTemplatePathDetails(this.context.workspaceFolder, template) } as Context);
      this.log(`Starting template generation for: '${this.context.relativeTemplate}'... Here we go! 🎉`, '\n');

      this.log('Fetching template configuration... Getting things ready! 🛠️');
      const templateConfig = await getTemplateConfig(template, Settings.configPath, this.context);
      this.setContext(templateConfig as Context);

      const fsPathFolder = this.context.fsPathFolder || this.context.workspaceFolder;
      this.context.out = path.resolve(fsPathFolder, interpolate(this.context.out, this.context) || fsPathFolder).replace(/\\/g, '/');

      this.log('Prompting for input values... Time to get some details! ✍️');
      await this._promptInputs(Object.keys(this.context.input), true);

      this.log("Listing all template files... Let's see what we have here! 📂");
      const allTemplateFiles = await listNestedFiles(
        template,
        [
          `${template}/_config`,
          `${template}/_config.json`,
          `${template}/_config.js`,
          Settings.configPath,
          ...getValueFromCallback(this.context.exclude, this.context, true)
        ],
        getValueFromCallback(this.context.include, this.context, true)
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
      await this.generateTemplateFiles(templateFiles);

      this.log(`[SUCCESS] Template generation completed for: '${this.context.relativeTemplate}'... High five! ✋`, '\n');
      vscode.window.showInformationMessage(`✨ ${this.context.templateName} templates have been generated successfully! 🎉`);
    } catch (err) {
      if (shouldExit(err, undefined, this.log)) return;
    }
  }
}
