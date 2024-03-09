import * as fsx from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { Settings } from "./Settings";
import * as caseConvert from "./case";
import { PathDetails, WithParsedPathDetails, getStats } from "./getPathsList";
import { InputConfig } from "./types";
import {
  copyFile,
  getAllCases,
  getInput,
  getTemplateName,
  getWorkSpaceFolder,
  interpolate,
  isPlainObject,
  resolveWithWorkspaceFolder,
  selectTemplateFile as selectTemplateFiles,
  selectTemplateFolder,
} from "./utils";

export class NewTemplates {
  configs: Record<string, any> = {
    ...caseConvert,
    package: {},
    env: process.env || {},
    input: Settings.input || {},
    variables: Settings.variables || {},
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

      const exampleTemplatePath = path.resolve(__dirname, "../Templates");

      const exampleReactComponentPath = path.join(exampleTemplatePath, `./ReactComponent/ReactComponent.txt`);
      const newReactComponentPath = path.join(newTemplatePath, "./${input.componentName}/${componentName}.tsx");
      copyFile(exampleReactComponentPath, newReactComponentPath);

      const exampleReactComponentStoriesPath = path.join(exampleTemplatePath, `./ReactComponent/ReactComponent.stories.txt`);
      const newReactComponentStoriesPath = path.join(newTemplatePath, "./${input.componentName}/${componentName}.stories${input.ext}");
      copyFile(exampleReactComponentStoriesPath, newReactComponentStoriesPath);

      const exampleIndexPath = path.join(exampleTemplatePath, `./ReactComponent/index.txt`);
      const newIndexPath = path.join(newTemplatePath, "./${input.componentName}/${input.fileName}.ts");
      copyFile(exampleIndexPath, newIndexPath);

      const exampleConfigPath = path.join(exampleTemplatePath, `./_config.json`);
      const newConfigPath = path.join(newTemplatePath, "./_config.json");
      copyFile(exampleConfigPath, newConfigPath);

      const newFile = await vscode.workspace.openTextDocument(newIndexPath);
      await vscode.window.showTextDocument(newFile, undefined, true);

      vscode.window.showInformationMessage(`${templateName} template is created successfully.`);
    } catch (err: unknown) {
      if (!(err instanceof Error) || err.message === "Exit") return;
      vscode.window.showErrorMessage(err.message);
      console.error(err);
    }
  }

  async newFilesFromTemplate(args: any) {
    try {
      const selectedTemplateFolder = await selectTemplateFolder();
      if (!selectedTemplateFolder) return;

      let outputDir = args?.fsPath || this.configs.workspaceFolder;
      outputDir = getStats(outputDir)?.isFile() ? path.dirname(outputDir) : outputDir;

      await this.#setPredefinedVariables(outputDir, args);

      const selectedTemplateFiles = await selectTemplateFiles(selectedTemplateFolder.basePath);
      if (!selectedTemplateFiles?.length) return;

      await this.#setTemplateConfig(selectedTemplateFolder.basePath);

      const parsedPaths = await this.#getParsedPathList(selectedTemplateFiles);
      await this.#generateTemplateFiles(parsedPaths, outputDir);
    } catch (err: unknown) {
      if (!(err instanceof Error) || err.message === "Exit") return;
      vscode.window.showErrorMessage(err.message);
      console.error(err);
    }
  }

  async #setPredefinedVariables(outputDir: string = "", args?: any) {
    const workspaceFolder = getWorkSpaceFolder();

    this.configs = {
      ...this.configs,
      userHome: process.env?.HOME,
      workspaceFolder,
      cwd: workspaceFolder,
      workspaceFolderBasename: path.basename(workspaceFolder),
      file: args?.fsPath || "",
      relativeFile: args?.fsPath ? path.relative(workspaceFolder, args?.fsPath) : "",
      relativeFileDirname: args?.fsPath ? path.relative(workspaceFolder, path.dirname(args?.fsPath)) : "",
      fileBasename: args?.fsPath ? path.basename(args?.fsPath) : "",
      fileBasenameNoExtension: args?.fsPath ? path.basename(args?.fsPath, path.extname(args?.fsPath)) : "",
      fileDirName: args?.fsPath ? path.dirname(args?.fsPath) : "",
      fileExtname: args?.fsPath ? path.extname(args?.fsPath) : "",
      outputDir,
      outputDirBasename: path.basename(outputDir),
      relativeOutputDir: path.relative(workspaceFolder, outputDir),
      outputFile: "",
      relativeOutputFile: "",
      outputFileBasename: "",
      outputFileBasenameNoExtension: "",
      outputFileExtname: "",
    };
  }

  async #setTemplateConfig(templateFolderPath: string) {
    const templateConfigPath = path.resolve(templateFolderPath, "./_config.json");

    if (!fsx.existsSync(templateConfigPath)) return;

    const configs = JSON.parse(fsx.readFileSync(templateConfigPath, "utf-8"));
    const input: Record<string, InputConfig> = { ...this.configs.input, ...(configs.input || {}) };
    const allCaseInputs = Object.entries(input)
      .filter(([, val]) => typeof val === "string")
      .reduce((res, [inputName, value]) => ({ ...res, ...getAllCases(inputName, value as string) }), {});

    this.configs = {
      ...allCaseInputs,
      ...this.configs,
      input,
      package: { ...(configs.package || {}), ...this.configs.package },
      env: { ...(configs.env || {}), ...this.configs.env },
      variables: { ...this.configs.variables, ...(configs.variables || {}) },
    };

    const preloadInputs = Object.entries(input)
      .filter(([, val]) => typeof val === "object" && val.promptAlways)
      .map(([inputName]) => inputName);

    await this.#collectUserInputs(preloadInputs.map((input) => `\${input.${input}}`));
  }

  async #generateTemplateFiles(parsedPaths: WithParsedPathDetails[], outputDir: string) {
    for (let pathDetails of parsedPaths) {
      const newFilePath = path.join(outputDir, `./${pathDetails.parsedRelativePath}`);

      if (fsx.existsSync(newFilePath) && !Settings.shouldOverwriteExistingFile) {
        const action = "Overwrite Existing Files ?";
        await vscode.window
          .showErrorMessage(`${path.basename(newFilePath)} file already exist.`, { modal: true }, action)
          .then((selectedAction) => {
            if (selectedAction !== action) throw Error("Exit");
            Settings.shouldOverwriteExistingFile = true;
          });
      }

      this.configs = {
        ...this.configs,
        outputFile: newFilePath,
        relativeOutputFile: path.relative(this.configs.workspaceFolder, newFilePath),
        outputFileBasename: path.basename(newFilePath),
        outputFileBasenameNoExtension: path.basename(newFilePath, path.extname(newFilePath)),
        outputFileExtname: path.extname(newFilePath),
      };

      const data = await fsx.readFile(pathDetails.basePath, "utf8");
      await this.#collectUserInputs(data);
      const updatedData = interpolate(data, this.configs);

      fsx.ensureFileSync(newFilePath);
      fsx.writeFileSync(newFilePath, updatedData);

      const newFile = await vscode.workspace.openTextDocument(newFilePath);
      await vscode.window.showTextDocument(newFile, undefined, true);
    }
  }

  async #getParsedPathList(pathsList: PathDetails[] = []) {
    const updatedPathsList: WithParsedPathDetails[] = [];
    for (let pathDetails of pathsList) {
      await this.#collectUserInputs(pathDetails.basePath);
      updatedPathsList.push({
        ...pathDetails,
        parsedBasePath: interpolate(pathDetails.basePath, this.configs),
        parsedRelativePath: interpolate(pathDetails.relativePath, this.configs),
      });
    }
    return updatedPathsList;
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
        this.configs = {
          ...getAllCases(inputName.replace(/\s/g, "_"), value),
          ...this.configs,
        };
      }
    }
  }
}
