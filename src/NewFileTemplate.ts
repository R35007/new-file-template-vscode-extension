import * as fsx from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { Settings } from "./Settings";
import * as caseConverter from "./caseConverter";
import { CONFIG_FILENAME, EXIT_CODE, InputConfig } from "./constants";
import { PathDetails, WithParsedPathDetails, getStats } from "./getPathsList";
import {
  copyFile,
  getInput,
  getTemplateName,
  getWorkSpaceFolder,
  interpolate,
  isPlainObject,
  resolveWithWorkspaceFolder,
  selectTemplateFile as selectTemplateFiles,
  selectTemplateFolder,
} from "./utils";

const exampleTemplatePath = path.resolve(__dirname, "../Templates");
const exampleReactComponentPath = path.join(exampleTemplatePath, `./ReactComponent/ReactComponent.txt`);
const exampleReactComponentStoriesPath = path.join(exampleTemplatePath, `./ReactComponent/ReactComponent.stories.txt`);
const exampleIndexPath = path.join(exampleTemplatePath, `./ReactComponent/index.txt`);
const exampleConfigPath = path.join(exampleTemplatePath, `./${CONFIG_FILENAME}`);

export class NewTemplates {
  configs: Record<string, any> = {
    ...caseConverter,
    process,
    __dirname,
    __filename,
    package: {},
    variables: Settings.variables || {},
    input: Settings.input || {},
  };

  constructor() {
    try {
      const packageJsonPath = resolveWithWorkspaceFolder("./package.json");
      if (!fsx.existsSync(packageJsonPath)) return;
      const packageJson = JSON.parse(fsx.readFileSync(packageJsonPath, "utf-8"));
      this.configs.package = packageJson;
    } catch {
      /* do nothing on error */
    }
  }

  async createTemplate() {
    try {
      const templateName = await getTemplateName();
      if (!templateName) return;

      const newTemplatePath = path.join(Settings.templatesPath, templateName);
      if (fsx.existsSync(newTemplatePath)) return vscode.window.showErrorMessage("Template already exists.");

      const newReactComponentPath = path.join(newTemplatePath, "./${input.componentName}/${componentName}.tsx");
      const newReactComponentStoriesPath = path.join(newTemplatePath, "./${input.componentName}/${componentName}.stories${input.ext}");
      const newIndexPath = path.join(newTemplatePath, "./${input.componentName}/${input.fileName}.ts");
      const newConfigPath = path.join(newTemplatePath, `./${CONFIG_FILENAME}`);

      copyFile(exampleReactComponentPath, newReactComponentPath);
      copyFile(exampleReactComponentStoriesPath, newReactComponentStoriesPath);
      copyFile(exampleIndexPath, newIndexPath);
      copyFile(exampleConfigPath, newConfigPath);

      const newFile = await vscode.workspace.openTextDocument(newIndexPath);
      await vscode.window.showTextDocument(newFile, undefined, true);

      vscode.window.showInformationMessage(`${templateName} template is created successfully.`);
    } catch (err: unknown) {
      if (!(err instanceof Error) || err.message === EXIT_CODE) return;
      vscode.window.showErrorMessage(err.message);
      console.error(err);
    }
  }

  async newFilesFromTemplate(args: any) {
    try {
      const selectedTemplateFolder = await selectTemplateFolder();
      if (!selectedTemplateFolder) return;

      let outputFileDirname = args?.fsPath || getWorkSpaceFolder(args?.fsPath);
      outputFileDirname = getStats(outputFileDirname)?.isFile() ? path.dirname(outputFileDirname) : outputFileDirname;

      await this.#setPredefinedVariables(outputFileDirname, args);

      const selectedTemplateFiles = await selectTemplateFiles(selectedTemplateFolder.basePath);
      if (!selectedTemplateFiles?.length) return;

      await this.#setTemplateConfig(selectedTemplateFolder.basePath);
      await this.#promptPreLoadInputs();

      const parsedPaths = await this.#getParsedPathList(selectedTemplateFiles);
      await this.#generateTemplateFiles(parsedPaths, outputFileDirname);
    } catch (err: unknown) {
      if (!(err instanceof Error) || err.message === EXIT_CODE) return;
      vscode.window.showErrorMessage(err.message);
      console.error(err);
    }
  }

  async #setPredefinedVariables(outputFileDirname: string = "", args?: any) {
    const workspaceFolder = getWorkSpaceFolder(args?.fsPath);

    this.configs = {
      ...this.configs,
      userHome: process.env?.HOME,
      workspaceFolder,
      cwd: workspaceFolder,
      workspaceFolderBasename: path.basename(workspaceFolder),
      file: args?.fsPath || "",
      fileWorkspaceFolder: workspaceFolder,
      relativeFile: args?.fsPath ? path.relative(workspaceFolder, args?.fsPath) : "",
      relativeFileDirname: args?.fsPath ? path.relative(workspaceFolder, path.dirname(args?.fsPath)) : "",
      fileBasename: args?.fsPath ? path.basename(args?.fsPath) : "",
      fileBasenameNoExtension: args?.fsPath ? path.basename(args?.fsPath, path.extname(args?.fsPath)) : "",
      fileExtname: args?.fsPath ? path.extname(args?.fsPath) : "",
      fileDirname: args?.fsPath ? path.dirname(args?.fsPath) : "",
      fileDirnameBasename: args?.fsPath ? path.basename(path.dirname(args?.fsPath)) : "",
      outputFile: "",
      outputFileWorkspaceFolder: "",
      relativeOutputFile: "",
      relativeOutputFileDirname: "",
      outputFileBasename: "",
      outputFileBasenameNoExtension: "",
      outputFileExtname: "",
      outputFileDirname,
      outputFileDirnameBasename: "",
    };
  }

  async #setTemplateConfig(templateFolderPath: string) {
    const templateConfigPath = path.resolve(templateFolderPath, `./${CONFIG_FILENAME}`);

    if (!fsx.existsSync(templateConfigPath)) return;

    const { input = {}, variables = {} } = JSON.parse(fsx.readFileSync(templateConfigPath, "utf-8"));

    this.configs = {
      ...this.configs,
      input: { ...this.configs.input, ...input },
      variables: { ...this.configs.variables, ...variables },
    };
  }

  async #promptPreLoadInputs() {
    const preloadInputs = Object.entries(this.configs.input as InputConfig)
      .filter(([, inputConfig]) => typeof inputConfig === "object" && inputConfig.promptAlways)
      .map(([inputName]) => inputName);

    await this.#collectUserInputs(preloadInputs.map((input) => `\${input.${input}}`));
  }

  async #getParsedPathList(pathsList: PathDetails[] = []) {
    const updatedPathsList: WithParsedPathDetails[] = [];
    for (let pathDetails of pathsList) {
      await this.#collectUserInputs(pathDetails.basePath);
      const parsedBasePath = interpolate(pathDetails.basePath, this.configs);
      const parsedRelativePath = interpolate(pathDetails.relativePath, this.configs);
      updatedPathsList.push({ ...pathDetails, parsedBasePath, parsedRelativePath });
    }
    return updatedPathsList;
  }

  async #generateTemplateFiles(parsedPaths: WithParsedPathDetails[], outputFileDirname: string) {
    for (let pathDetails of parsedPaths) {
      const newFilePath = path.join(outputFileDirname, `./${pathDetails.parsedRelativePath}`);

      // If file already exist and shouldOverwriteExistingFile setting is false then prompt the user to overwrite the existing file
      if (fsx.existsSync(newFilePath) && !Settings.shouldOverwriteExistingFile) {
        const action = "Overwrite Existing Files ?";
        await vscode.window
          .showErrorMessage(`${path.basename(newFilePath)} file already exist.`, { modal: true }, action)
          .then((selectedAction) => {
            if (selectedAction !== action) throw Error(EXIT_CODE);
            Settings.shouldOverwriteExistingFile = true;
          });
      }

      this.configs = {
        ...this.configs,
        outputFile: newFilePath,
        outputFileWorkspaceFolder: getWorkSpaceFolder(newFilePath),
        relativeOutputFile: path.relative(getWorkSpaceFolder(newFilePath), newFilePath),
        relativeOutputFileDirname: path.relative(getWorkSpaceFolder(newFilePath), path.dirname(newFilePath)),
        outputFileBasename: path.basename(newFilePath),
        outputFileBasenameNoExtension: path.basename(newFilePath, path.extname(newFilePath)),
        outputFileExtname: path.extname(newFilePath),
        outputFileDirname: path.dirname(newFilePath),
        outputFileDirnameBasename: path.basename(path.dirname(newFilePath)),
      };

      const data = await fsx.readFile(pathDetails.basePath, "utf8");
      await this.#collectUserInputs(data);
      const updatedData = await interpolate(data, this.configs);

      fsx.ensureFileSync(newFilePath);
      fsx.writeFileSync(newFilePath, updatedData);

      const newFile = await vscode.workspace.openTextDocument(newFilePath);
      await vscode.window.showTextDocument(newFile, undefined, true);
    }
  }

  async #collectUserInputs(strings: string | string[] = []) {
    const data = ([] as string[]).concat(strings);
    const pattern = /\$\{input\.[^}]*\}/g; // pattern to match ${input.<any string here>}

    for (const str of data) {
      const matches = Array.from(new Set(str.match(pattern)));
      const unknownInputs = matches
        .map((match) => match.slice(8, -1)?.trim()) // Extract user-defined variables
        .filter((key) => this.configs.input[key] === undefined || typeof this.configs.input[key] !== "string"); // Filter only unknown inputs

      for (const inputName of unknownInputs) {
        const inputConfig = this.configs.input[inputName];
        const value = await getInput(inputName, isPlainObject(inputConfig) ? inputConfig : {}, this.configs);
        if (!value?.trim().length) throw Error("Exit");
        this.configs.input[inputName] = value;
      }
    }
  }
}
