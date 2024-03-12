import * as fsx from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { Settings } from "./Settings";
import * as caseConverter from "./caseConverter";
import { CONFIG_FILENAME, Commands, EXIT_CODE, InputConfig } from "./constants";
import { getPathsList } from "./getPathsList";

export const isPlainObject = (val?: any) => !!(val && typeof val === "object" && !Array.isArray(val));

export const getWorkSpaceFolder = (filePath: string = "") => {
  const activePath: string = filePath.replaceAll("\\", "/") || "";
  const workspaceFolders = vscode.workspace.workspaceFolders || [];

  if (!activePath?.trim().length) return workspaceFolders[0]?.uri.fsPath.replaceAll("\\", "/") || "./";

  return workspaceFolders.map((folder) => folder.uri.fsPath).find((folder) => activePath.includes(folder.replaceAll("\\", "/"))) || "./";
};

const handleUndefinedVariable = (error: Error, format: string = "", object: Record<string, any> = {}) => {
  const undefinedVariable = error.message.replace("is not defined", "").trim();

  const convertToMethodName = Object.keys(caseConverter).find((methodName) =>
    undefinedVariable.endsWith(methodName)
  ) as keyof typeof caseConverter;

  const transform = convertToMethodName && (caseConverter[convertToMethodName] as (input?: string) => string | undefined);
  const inputName = !!transform ? undefinedVariable.replace(convertToMethodName, "").trim() : undefinedVariable;

  const key = !!transform ? `${inputName}${convertToMethodName}` : inputName;
  const value = isPlainObject(object.input[inputName]) ? object.input[inputName].value : object.input[inputName];

  if (value === undefined) {
    vscode.window.showErrorMessage(error.message);
    console.error(error);
    throw Error(EXIT_CODE);
  }

  return interpolate(format, { ...object, [key]: !!transform ? transform(value) : value });
};

// Helps to convert template literal strings to applied values.
export const interpolate = (format: string = "", object: Record<string, any> = {}): string => {
  try {
    const keys = Object.keys(object);
    const values = Object.values(object);
    const interpolatedFunction = new Function(...keys, `return \`${format}\`;`);
    return interpolatedFunction(...values);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.endsWith("is not defined")) return handleUndefinedVariable(error, format, object);
    const errorMessage = error instanceof Error ? error.message : `${error}`;
    vscode.window.showErrorMessage(errorMessage);
    console.error(error);
    throw Error(EXIT_CODE);
  }
};

export const getTemplateName = () =>
  vscode.window.showInputBox({
    title: "Template Name",
    value: "React Component",
    placeHolder: "Please enter the template name",
  });

export const getInput = async (inputName: string, inputConfig: InputConfig = {} as InputConfig, interpolateObject: object) => {
  if (inputConfig.options?.length) {
    const picked: any = await vscode.window.showQuickPick(inputConfig.options as vscode.QuickPickItem[], {
      placeHolder: inputConfig.placeHolder || `Please enter a ${inputName}`,
      title: inputConfig.title || caseConverter._toTitleCase(inputName),
      canPickMany: false,
    });

    const value = typeof picked === "object" ? picked.value?.trim() : picked?.trim();
    return inputConfig.afterInput?.trim().length ? interpolate(inputConfig.afterInput, { ...interpolateObject, value }) : value;
  }

  const validateInput = (value: any) => {
    if (!inputConfig.validator?.length) return;
    const result = interpolate(inputConfig.validator, { ...interpolateObject, value });
    if (result?.length) return result;
  };

  const input = await vscode.window.showInputBox({
    placeHolder: inputConfig.placeHolder || `Please enter a ${inputName}`,
    title: caseConverter._toTitleCase(inputName),
    value: inputConfig.title || inputConfig.value,
    validateInput: inputConfig.validator?.trim().length ? validateInput : undefined,
  });

  const value = input?.trim();
  return inputConfig.afterInput?.trim().length ? interpolate(inputConfig.afterInput, { ...interpolateObject, value }) : value;
};

export const getSelect = (inputName: string, inputOptions: string[] = []) =>
  vscode.window.showQuickPick(inputOptions, {
    placeHolder: `Please pick a ${inputName}`,
    title: caseConverter._toTitleCase(inputName),
  });

export const selectTemplateFolder = async () => {
  const folders = getPathsList(Settings.templatesPath, { withFiles: false, level: 1, relativeTo: Settings.templatesPath });
  folders.shift(); // remove the template directory from the list

  // If there is not template prompt to Create a template
  if (!folders?.length) {
    const action = "Create New Sample Template";
    return vscode.window
      .showErrorMessage(
        `No Templates Found ! 
        Click the below button to create a new sample template.`,
        { modal: true },
        action
      )
      .then((selectedAction) => {
        if (selectedAction !== action) throw Error(EXIT_CODE);
        vscode.commands.executeCommand(Commands.CREATE_SAMPLE_TEMPLATE);
      });
  }

  return vscode.window.showQuickPick(
    folders.map((folder) => ({ label: folder.baseName, ...folder })),
    { title: "Templates", placeHolder: "Please select a template" }
  );
};

export const selectTemplateFile = async (templatePath: string) => {
  const files = getPathsList(templatePath, {
    withFolders: false,
    relativeTo: templatePath,
    excludeFile: [`${templatePath}/${CONFIG_FILENAME}`],
  });
  return vscode.window.showQuickPick(
    files.map((folder) => ({ label: folder.baseName, description: folder.relativePath, ...folder, picked: true })),
    {
      title: "File Templates",
      placeHolder: "Please pick template files to generate",
      canPickMany: true,
      matchOnDescription: true,
      matchOnDetail: true,
    }
  );
};

export const resolveWithWorkspaceFolder = (relativePath: string) => {
  const workspaceFolder = getWorkSpaceFolder();
  return path.resolve(workspaceFolder, relativePath);
};

export const copyFile = (fromPath: string, toPath: string) => {
  fsx.ensureFileSync(toPath);
  fsx.writeFileSync(toPath, fsx.readFileSync(fromPath, "utf-8"));
};
