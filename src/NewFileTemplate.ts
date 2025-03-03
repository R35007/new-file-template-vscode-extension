import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Settings } from './Settings';
import * as caseConverter from './caseConverter';
import { EXIT_CODE, InputConfig, TemplateConfig } from './constants';
import {
  getInput,
  getTemplateConfig,
  getTemplateName,
  getWorkSpaceFolder,
  interpolate,
  mergeConfig,
  resolveWithWorkspaceFolder,
  selectTemplateFiles
} from './utils';

const exampleTemplatePath = path.resolve(__dirname, '../Templates');

export class NewTemplates {
  config: TemplateConfig = {
    ...caseConverter,
    process,
    __dirname,
    __filename,
    package: {},
    exclude: [],
    workspaceFolder: getWorkSpaceFolder(),
    cwd: getWorkSpaceFolder(),
    workspaceFolderBasename: path.basename(getWorkSpaceFolder()),
    fileWorkspaceFolder: getWorkSpaceFolder(),
    variables: Settings.variables,
    input: Settings.input,
    inputValues: {}
  };

  constructor(config?: TemplateConfig) {
    try {
      this.config = mergeConfig(this.config, config);
      const packageJsonPath = resolveWithWorkspaceFolder('./package.json');
      if (Object.keys(this.config.package).length || !fsx.existsSync(packageJsonPath)) return;
      const packageJson = JSON.parse(fsx.readFileSync(packageJsonPath, 'utf-8'));
      this.config.package = packageJson;
    } catch {
      /* do nothing on error */
    }
  }

  #setPredefinedVariables(args?: any) {
    const workspaceFolder = getWorkSpaceFolder(args?.fsPath);

    this.config = mergeConfig(this.config, {
      userHome: process.env?.HOME,
      workspaceFolder,
      cwd: workspaceFolder,
      workspaceFolderBasename: path.basename(workspaceFolder),
      fsPath: args?.fsPath,
      file: args?.fsPath,
      fileWorkspaceFolder: workspaceFolder,
      relativeFile: args?.fsPath && path.relative(workspaceFolder, args?.fsPath),
      relativeFileDirname: args?.fsPath && path.relative(workspaceFolder, path.dirname(args?.fsPath)),
      fileBasename: args?.fsPath && path.basename(args?.fsPath),
      fileDirname: args?.fsPath && path.dirname(args?.fsPath),
      fileDirnameBasename: args?.fsPath && path.basename(path.dirname(args?.fsPath)),
      fileBasenameNoExtension: args?.fsPath && path.basename(args?.fsPath, path.extname(args?.fsPath)),
      fileExtname: args?.fsPath && path.extname(args?.fsPath)
    } as TemplateConfig);
  }

  async createTemplate() {
    try {
      const templateName = await getTemplateName();
      if (!templateName) return;
      const newTemplatePath = path.join(Settings.vscodeTemplatePath, templateName);
      if (fsx.existsSync(newTemplatePath)) return vscode.window.showErrorMessage('Template already exists.');
      fsx.ensureDirSync(newTemplatePath);
      fsx.copySync(exampleTemplatePath, newTemplatePath);

      const newIndexPath = path.join(newTemplatePath, `./index.ts.template.js`);

      const newFile = await vscode.workspace.openTextDocument(newIndexPath);
      await vscode.window.showTextDocument(newFile, undefined, true);

      vscode.window.showInformationMessage(`${templateName} template is created successfully.`);
    } catch (err: unknown) {
      if (!(err instanceof Error) || err.message === EXIT_CODE) return;
      vscode.window.showErrorMessage(err.message);
      console.error(err);
    }
  }

  async #collectInputsFromDataString(data: string = '') {
    const matches = Array.from(new Set(String(data).match(/\$\{input\.[^}]*\}/g))); // pattern to match ${input.<any string here>}
    const unknownInputs = matches.map((match) => match.slice(8, -1)?.trim()); // Extract user-defined variables. eg: ${input.componentName} -> componentName

    for (const inputName of unknownInputs) {
      // Skip if value is already present
      if (this.config.inputValues[inputName as keyof InputConfig] !== undefined) continue;
      const inputConfig = this.config.input[inputName as keyof InputConfig];

      const value = await getInput(inputName, inputConfig, this.config);
      if (value === undefined) throw Error('Exit'); // Don't proceed if user exits
      this.config.input[inputName as keyof InputConfig] = value;
      this.config.inputValues[inputName] = value;
    }
  }

  async #promptPreLoadInputs() {
    for (const [inputName, inputConfig] of Object.entries(this.config.input)) {
      // Skip if value is already present
      if (this.config.inputValues[inputName as keyof InputConfig] !== undefined) continue;

      if (inputConfig.promptAlways || (typeof inputConfig.when === 'function' && inputConfig.when(this.config) === true)) {
        const value = await getInput(inputName, inputConfig!, this.config);
        if (value === undefined) throw Error('Exit'); // Don't proceed if user exits
        this.config.input[inputName as keyof InputConfig] = value;
        this.config.inputValues[inputName] = value;
      }
    }
  }

  async #generateTemplateFiles(parsedPaths: Array<{ templateFile: string; parsedTemplateFile: string }>) {
    const beforeAllConfig = this.config.beforeAll?.(this.config);
    if (beforeAllConfig === false) return;
    this.config = mergeConfig(this.config, beforeAllConfig as TemplateConfig);

    const destinationPath =
      typeof this.config.out === 'string'
        ? path.resolve(this.config.workspaceFolder, interpolate(this.config.out.replace(/\\/g, '/'), this.config))
        : this.config.workspaceFolder;

    for (let obj of parsedPaths) {
      try {
        let outputFile = path.join(destinationPath, path.relative(this.config.templateDirname!, obj.parsedTemplateFile));
        const shouldRequire = path.basename(outputFile).endsWith('.template.js');
        outputFile = shouldRequire ? outputFile.replace(/\.template\.js$/, '') : outputFile;

        // If file already exist and shouldOverwriteExistingFile setting is false then prompt the user to overwrite the existing file
        if (fsx.existsSync(outputFile) && !Settings.shouldOverwriteExistingFile) {
          const actions = ['Always Overwrite Existing Files ?', 'Overwrite this file', 'Skip this file'];
          const canOverwriteFile = await vscode.window
            .showErrorMessage(`${path.basename(outputFile)} file already exist.`, { modal: true }, ...actions)
            .then((selectedAction) => {
              if (!selectedAction || !actions.includes(selectedAction)) throw Error(EXIT_CODE); // Exit if user didn't pick any choice
              if (selectedAction === actions[0]) Settings.shouldOverwriteExistingFile = true; // Always overwrite existing files
              if (selectedAction === actions[2]) return false; // Skip this file
              return true;
            });

          if (!canOverwriteFile) continue;
        }

        this.config = mergeConfig(this.config, {
          templateFile: obj.templateFile,
          templateFileBaseName: path.basename(obj.templateFile),
          relativeTemplateFile: path.relative(getWorkSpaceFolder(outputFile), obj.templateFile),
          outputFile,
          outputFileWorkspaceFolder: getWorkSpaceFolder(outputFile),
          relativeOutputFile: path.relative(getWorkSpaceFolder(outputFile), outputFile),
          relativeOutputFileDirname: path.relative(getWorkSpaceFolder(outputFile), path.dirname(outputFile)),
          outputFileBasename: path.basename(outputFile),
          outputFileBasenameNoExtension: path.basename(outputFile, path.extname(outputFile)),
          outputFileExtname: path.extname(outputFile),
          outputFileDirname: path.dirname(outputFile),
          outputFileDirnameBasename: path.basename(path.dirname(outputFile))
        } as TemplateConfig);

        const beforeEachConfig = this.config.beforeEach?.(this.config);
        if (beforeEachConfig === false) continue;
        this.config = mergeConfig(this.config, beforeEachConfig as TemplateConfig);

        let data = '';

        if (shouldRequire) {
          try {
            delete require.cache[require.resolve(obj.templateFile)];
            const module = require(obj.templateFile);
            if (typeof module === 'function') data = await module(this.config);
            else data = JSON.stringify(module, null, 2);
          } catch (err) {
            console.log(err);
          }
        }

        if (!data) {
          try {
            data = await fsx.readFile(obj.templateFile, 'utf8');
          } catch (err) {
            console.log(err);
          }
        }

        await this.#collectInputsFromDataString(data);
        const updatedData = await interpolate(data, this.config);

        fsx.ensureFileSync(outputFile);
        fsx.writeFileSync(outputFile, updatedData);

        const newFile = await vscode.workspace.openTextDocument(outputFile);
        await vscode.window.showTextDocument(newFile, undefined, true);

        const afterEachConfig = this.config.afterEach?.(this.config);
        if (afterEachConfig === false) return;
        this.config = mergeConfig(this.config, beforeEachConfig as TemplateConfig);
      } catch (err) {
        if (!(err instanceof Error) || err.message === EXIT_CODE) throw Error(EXIT_CODE);
        console.log(err);
      }
    }

    const afterAllConfig = this.config.afterAll?.(this.config);
    if (afterAllConfig === false) return;
    this.config = mergeConfig(this.config, afterAllConfig as TemplateConfig);
  }

  async #getParsedPathList(templatePaths: string[] = []) {
    const updatedPathsList: Array<{ templateFile: string; parsedTemplateFile: string }> = [];
    for (let templateFile of templatePaths) {
      await this.#collectInputsFromDataString(templateFile);
      const parsedTemplateFile = interpolate(templateFile, this.config);
      updatedPathsList.push({ templateFile, parsedTemplateFile });
    }
    return updatedPathsList;
  }

  async newFilesFromTemplate(args: any, templateDirname?: string) {
    if (!templateDirname?.length) return;
    const templateConfig = await getTemplateConfig(templateDirname);

    this.config = mergeConfig(this.config, {
      templateDirname,
      templateBasename: path.basename(templateDirname),
      templateName: path.basename(templateDirname),
      ...templateConfig
    } as TemplateConfig);

    const fsPathFolder = args?.fsPath
      ? fsx.statSync(args?.fsPath).isFile()
        ? path.dirname(args.fsPath)
        : args.fsPath
      : getWorkSpaceFolder();

    this.config.out = path.resolve(fsPathFolder, this.config.out || fsPathFolder);

    await this.#setPredefinedVariables(args);
    await this.#promptPreLoadInputs();

    const selectedTemplateFiles = await selectTemplateFiles(templateDirname, this.config.templateName!, this.config.exclude);
    if (!selectedTemplateFiles?.length) return;

    const parsedPaths = await this.#getParsedPathList(selectedTemplateFiles.map((file) => file.value));
    await this.#generateTemplateFiles(parsedPaths);
  }
}
