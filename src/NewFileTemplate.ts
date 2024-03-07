import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Settings } from './Settings';
import * as caseConvert from './case';
import { PathDetails, WithParsedPathDetails, getStats } from './getPathsList';
import { copyFile, getAllCases, getInput, getTemplateName, getWorkSpaceFolder, interpolate, resolveWithWorkspaceFolder, selectTemplateFile as selectTemplateFiles, selectTemplateFolder } from './utils';

export class NewTemplates {
    configs: Record<string, any> = {
        _: caseConvert,
        input: {},
        package: {},
        env: process.env || {},
        variables: Settings.variables || {},
        inputDetails: Settings.inputDetails || {},
    };

    constructor() {
        try {
            const packageJsonPath = resolveWithWorkspaceFolder("./package.json");
            if (!fsx.existsSync(packageJsonPath)) return;
            const packageJson = JSON.parse(fsx.readFileSync(packageJsonPath, "utf-8"));
            this.configs.package = packageJson;
        } catch {/* do nothing on error */ }
    }

    async createTemplate() {
        try {
            const templateName = await getTemplateName();
            if (!templateName) return;
    
            const newTemplatePath = path.join(Settings.templatesPath, templateName);
            if (fsx.existsSync(newTemplatePath)) return vscode.window.showErrorMessage("Template already exists.");
    
            const exampleTemplatePath = path.resolve(__dirname, "../Templates");
            
            const exampleReactComponentPath = path.join(exampleTemplatePath, `./ReactComponent/ReactComponent.txt`);
            const newReactComponentPath = path.join(newTemplatePath, './${input.componentName}/${componentName}.tsx');
            copyFile(exampleReactComponentPath, newReactComponentPath);
            
            const exampleReactComponentStoriesPath = path.join(exampleTemplatePath, `./ReactComponent/ReactComponent.stories.txt`);
            const newReactComponentStoriesPath = path.join(newTemplatePath, './${input.componentName}/${componentName}.stories${input.ext}');
            copyFile(exampleReactComponentStoriesPath, newReactComponentStoriesPath);
            
            const exampleIndexPath = path.join(exampleTemplatePath, `./ReactComponent/index.txt`);
            const newIndexPath = path.join(newTemplatePath, './${input.componentName}/${input.fileName}.ts');
            copyFile(exampleIndexPath, newIndexPath);
            
            const exampleConfigPath = path.join(exampleTemplatePath, `./_config.json`);
            const newConfigPath = path.join(newTemplatePath, './_config.json');
            copyFile(exampleConfigPath, newConfigPath);
    
            const newFile = await vscode.workspace.openTextDocument(newIndexPath);
            await vscode.window.showTextDocument(newFile, undefined, true);
    
            vscode.window.showInformationMessage(`${templateName} template is created successfully.`);
        } catch (err: unknown) {
            if (!(err instanceof Error) || err.message === "Exit") return;
            vscode.window.showErrorMessage(err.message);
        }
    }

    async newFilesFromTemplate(args: any) {
        try {
            const selectedTemplateFolder = await selectTemplateFolder();
            if (!selectedTemplateFolder) return;

            await this.#setPredefinedVariables(args);

            let targetPath = args?.fsPath || this.configs.workspaceFolder;
            targetPath = getStats(targetPath)?.isFile() ? path.dirname(targetPath) : targetPath;
            
            await this.#setTemplateConfig(selectedTemplateFolder.basePath);

            const selectedTemplateFiles = await selectTemplateFiles(selectedTemplateFolder.basePath);
            if (!selectedTemplateFiles?.length) return;

            const parsedPaths = await this.#getParsedPathList(selectedTemplateFiles);
            await this.#generateTemplateFiles(parsedPaths, targetPath);
        } catch (err: unknown) {
            if (!(err instanceof Error) || err.message === "Exit") return;
            vscode.window.showErrorMessage(err.message);
        }
    }

    async #setPredefinedVariables(args: any) {
        const workspaceFolder = getWorkSpaceFolder();
        
        this.configs = {
            ...this.configs,
            userHome: process.env?.HOME,
            workspaceFolder,
            cwd: workspaceFolder,
            workspaceFolderBasename: path.basename(workspaceFolder),
        };
        
        if (!args.fsPath) return;
        
        this.configs = {
            ...this.configs,
            file: args?.fsPath,
            relativeFile: path.relative(this.configs.workspaceFolder, args?.fsPath),
            relativeFileDirname: path.relative(this.configs.workspaceFolder, path.dirname(args?.fsPath)),
            fileBasename: path.basename(args?.fsPath),
            fileBasenameNoExtension: path.basename(args?.fsPath, path.extname(args?.fsPath)),
            fileDirName: path.dirname(args?.fsPath),
            fileExtname: path.extname(args?.fsPath),
        };
    }

    async #setTemplateConfig(templateFolderPath: string) {
        try {
            const templateConfigPath = path.resolve(templateFolderPath, "./_config.json");
            if (fsx.existsSync(templateConfigPath)) {
                const configs = JSON.parse(fsx.readFileSync(templateConfigPath, "utf-8"));
                const input: Record<string, string> = { ...this.configs.input, ...(configs.input || {}) };
                const allCaseInputs = Object.entries(input).reduce((res, [inputName, value]) => ({ ...res, ...getAllCases(inputName, value) }), {});

                this.configs = {
                    ...allCaseInputs,
                    ...this.configs,
                    input,
                    package: { ...(configs.package || {}), ...this.configs.package },
                    env: { ...(configs.env || {}), ...this.configs.env },
                    variables: { ...this.configs.variables, ...(configs.variables || {}) },
                    inputDetails: { ...this.configs.inputDetails, ...(configs.inputDetails || {}) },
                };
            }
        } catch {/* do nothing on error */ }
    }

    async #generateTemplateFiles(parsedPaths: WithParsedPathDetails[], outputDir: string) {

        this.configs.outputDir = outputDir;
        this.configs.outputDirBasename = path.basename(outputDir);
        this.configs.relativeOutputDir = path.relative(this.configs.workspaceFolder, outputDir);

        for (let pathDetails of parsedPaths) {
            const newFilePath = path.join(outputDir, `./${pathDetails.parsedRelativePath}`);

            if (fsx.existsSync(newFilePath) && !Settings.shouldOverwriteExistingFile) {
                const action = "Overwrite Existing Files ?";
                await vscode.window.showErrorMessage(`${path.basename(newFilePath)} file already exist.`, { modal: true }, action).then(selectedAction => {
                    if (selectedAction !== action) throw Error("Exit");
                    Settings.shouldOverwriteExistingFile = true;
                });
            };

            this.configs = {
                ...this.configs,
                outputFile:  newFilePath,
                relativeOutputFile:  path.relative(this.configs.workspaceFolder, newFilePath),
                outputFileBasename:  path.basename(newFilePath),
                outputFileBasenameNoExtension:  path.basename(newFilePath, path.extname(newFilePath)),
                outputFileExtname:  path.extname(newFilePath),
            };


            const data = await fsx.readFile(pathDetails.basePath, 'utf8');
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
                parsedRelativePath: interpolate(pathDetails.relativePath, this.configs)
            });
        }
        return updatedPathsList;
    };

    async #collectUserInputs(strings: string | string[] = []) {
        const data = ([] as string[]).concat(strings);
        const pattern = /\$\{input\.[^}]*\}/g; // pattern to match ${input.<any string here>}

        for (const str of data) {
            const matches = Array.from(new Set(str.match(pattern)));
            const unknownInputs = matches
                .map(match => match.slice(8, -1)?.trim()) // Extract user-defined variables
                .filter(key => !this.configs.input[key]); // Filter only unknown inputs

            for (const inputName of unknownInputs) {
                const value = await getInput(inputName, this.configs.inputDetails[inputName]);
                if (!value) throw Error("Exit");
                this.configs.input[inputName] = value;
                this.configs = {
                    ...getAllCases(inputName.replace(/\s/g, "_"), value),
                    ...this.configs,
                };
            }
        }
    }
}
