import * as path from 'path';
import * as vscode from 'vscode';
import { Settings } from './Settings';
import * as caseConvert from './case';
import { toSuperTitleCase } from './case';
import { getPathsList } from './getPathsList';
import { Commands } from './enum';

export const getWorkSpaceFolder = () => vscode.workspace.workspaceFolders?.[0].uri.fsPath || './';

export const getTemplateName = () => vscode.window.showInputBox({
    title: 'Template Name',
    value: 'My Template',
    placeHolder: "Please enter the template name"
});

export const getInput = async (inputName: string, inputDetails: { validate?: string[], convert?: string; options?: string[], default?: string; description?: string } = {}) => {
    if (inputDetails.options?.length) {
        const quickPickList = inputDetails.options.map(opt => ({ label: opt, ...(opt === inputDetails.default ? { picked: true } : {}) }));
        const picked = await vscode.window.showQuickPick(quickPickList, {
            placeHolder: inputDetails.description || `Please enter a ${inputName}`,
            title: toSuperTitleCase(inputName),
            canPickMany: false,

        });
        return caseConvert[inputDetails.convert as keyof typeof caseConvert]?.(picked?.label) || picked?.label;
    }
    const value = await vscode.window.showInputBox({
        placeHolder: inputDetails.description || `Please enter a ${inputName}`,
        title: toSuperTitleCase(inputName),
        value: inputDetails.default,
    });

    return caseConvert[inputDetails.convert as keyof typeof caseConvert]?.(value?.trim()) || value?.trim();
};

export const getSelect = (inputName: string, inputOptions: string[] = []) => vscode.window.showQuickPick(inputOptions, {
    placeHolder: `Please pick a ${inputName}`,
    title: toSuperTitleCase(inputName)
});

export const selectTemplateFolder = async () => {
    const folders = getPathsList(Settings.templatesPath, { withFiles: false, level: 1, relativeTo: Settings.templatesPath });
    folders.shift(); // remove the template directory from the list

    // If there is not template prompt to Create a template
    if(!folders?.length) {
        const action = "Create New Template";
        return vscode.window.showErrorMessage(`No Templates Found ! 
        Click the "${action}" button to create a sample template files.`, { modal: true }, action).then(selectedAction => {
            if (selectedAction !== action) throw Error("Exit");
            vscode.commands.executeCommand(Commands.CREATE_TEMPLATE);
        });
    }

    return vscode.window.showQuickPick(
        folders.map(folder => ({ label: folder.baseName, ...folder })),
        { title: "Templates", placeHolder: "Please select a template" }
    );
};

export const selectTemplateFile = async (templatePath: string) => {
    const files = getPathsList(templatePath, { withFolders: false, relativeTo: templatePath, excludeFile: [`${templatePath}/_config.json`] });
    return vscode.window.showQuickPick(
        files.map(folder => ({ label: folder.baseName, description: folder.relativePath, ...folder, picked: true })),
        { title: "File Templates", placeHolder: "Please pick template files to generate", canPickMany: true, matchOnDescription: true, matchOnDetail: true }
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
    [`${inputName}_toAlphaNumericCase`]: caseConvert.toAlphaNumericCase(value),
    [`${inputName}_toSnakeCase`]: caseConvert.toSnakeCase(value),
    [`${inputName}_toCamelCase`]: caseConvert.toCamelCase(value),
    [`${inputName}_toPascalCase`]: caseConvert.toPascalCase(value),
    [`${inputName}_toKebabCase`]: caseConvert.toKebabCase(value),
    [`${inputName}_toTitleCase`]: caseConvert.toTitleCase(value),
    [`${inputName}_toSentenceCase`]: caseConvert.toSentenceCase(value),
    [`${inputName}_toUppercase`]: caseConvert.toUppercase(value),
    [`${inputName}_toLowercase`]: caseConvert.toLowercase(value),
    [`${inputName}_toCapitalizedWords`]: caseConvert.toCapitalizedWords(value),
    [`${inputName}_toStudlyCaps`]: caseConvert.toStudlyCaps(value),
    [`${inputName}_toTrainCase`]: caseConvert.toTrainCase(value),
    [`${inputName}_toScreamingSnakeCase`]: caseConvert.toScreamingSnakeCase(value),
    [`${inputName}_toScreamingKebabCase`]: caseConvert.toScreamingKebabCase(value),
    [`${inputName}_toDotCase`]: caseConvert.toDotCase(value),
    [`${inputName}_toSuperTitleCase`]: caseConvert.toSuperTitleCase(value),
});
