import * as fsx from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { Settings } from "./Settings";
import * as caseConvert from "./case";
import { getPathsList } from "./getPathsList";
import { Commands, InputConfig } from "./types";

export const getWorkSpaceFolder = () => vscode.workspace.workspaceFolders?.[0].uri.fsPath || "./";

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
      title: inputConfig.title || caseConvert._toTitleCase(inputName),
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
    title: caseConvert._toTitleCase(inputName),
    value: inputConfig.title || inputConfig.value,
    validateInput: inputConfig.validator?.trim().length ? validateInput : undefined,
  });

  const value = input?.trim();
  return inputConfig.afterInput?.trim().length ? interpolate(inputConfig.afterInput, { ...interpolateObject, value }) : value;
};

export const getSelect = (inputName: string, inputOptions: string[] = []) =>
  vscode.window.showQuickPick(inputOptions, {
    placeHolder: `Please pick a ${inputName}`,
    title: caseConvert._toTitleCase(inputName),
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
        if (selectedAction !== action) throw Error("Exit");
        vscode.commands.executeCommand(Commands.CREATE_SAMPLE_TEMPLATE);
      });
  }

  return vscode.window.showQuickPick(
    folders.map((folder) => ({ label: folder.baseName, ...folder })),
    { title: "Templates", placeHolder: "Please select a template" }
  );
};

export const selectTemplateFile = async (templatePath: string) => {
  const files = getPathsList(templatePath, { withFolders: false, relativeTo: templatePath, excludeFile: [`${templatePath}/_config.json`] });
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

// Helps to convert template literal strings to applied values.
export const interpolate = (format: string = "", object: object = {}) => {
  try {
    const keys = Object.keys(object);
    const values = Object.values(object);
    const interpolatedFunction = new Function(...keys, `return \`${format}\`;`);
    return interpolatedFunction(...values);
  } catch (error: any) {
    vscode.window.showErrorMessage(error.message);
    return format;
  }
};

export const getAllCases = (inputName: string, value: string) => ({
  [inputName]: value,
  [`${inputName}_toAlphaNumericCase`]: caseConvert._toAlphaNumericCase(value),
  [`${inputName}_toSpaceCase`]: caseConvert._toSpaceCase(value),
  [`${inputName}_toTitleCase`]: caseConvert._toTitleCase(value),
  [`${inputName}_toCamelCase`]: caseConvert._toCamelCase(value),
  [`${inputName}_toPascalCase`]: caseConvert._toPascalCase(value),
  [`${inputName}_toSnakeCase`]: caseConvert._toSnakeCase(value),
  [`${inputName}_toSnakeUpperCase`]: caseConvert._toSnakeUpperCase(value),
  [`${inputName}_toSnakeTitleCase`]: caseConvert._toSnakeTitleCase(value),
  [`${inputName}_toKebabCase`]: caseConvert._toKebabCase(value),
  [`${inputName}_toKebabUpperCase`]: caseConvert._toKebabUpperCase(value),
  [`${inputName}_toKebabTitleCase`]: caseConvert._toKebabTitleCase(value),
  [`${inputName}_toDotCase`]: caseConvert._toDotCase(value),
  [`${inputName}_toDotUpperCase`]: caseConvert._toDotUpperCase(value),
  [`${inputName}_toDotTitleCase`]: caseConvert._toDotTitleCase(value),
  [`${inputName}_toSentenceCase`]: caseConvert._toSentenceCase(value),
  [`${inputName}_toCapitalizedWords`]: caseConvert._toCapitalizedWords(value),
  [`${inputName}_toStudlyCaps`]: caseConvert._toStudlyCaps(value),
  [`${inputName}_toUpperCase`]: caseConvert._toUpperCase(value),
  [`${inputName}_toLowerCase`]: caseConvert._toLowerCase(value),
});

export const copyFile = (fromPath: string, toPath: string) => {
  fsx.ensureFileSync(toPath);
  fsx.writeFileSync(toPath, fsx.readFileSync(fromPath, "utf-8"));
};

export const isPlainObject = (val?: any) => !!(val && typeof val === "object" && !Array.isArray(val));
