import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import * as caseConverter from './caseConverter';
import { Settings } from './Settings';
import { Context, EXIT, InputConfig } from './types';
import { interpolate, isArray, isPlainObject, parseInputTransformVariable } from './utils';

export const getTemplateName = () =>
  vscode.window.showInputBox({
    title: 'Template Name',
    value: 'React Component',
    ignoreFocusOut: true,
    placeHolder: 'Please enter the template name'
  });

export const pickTemplateFolders = async (templates: string[]) => {
  return vscode.window.showQuickPick(
    templates.map((template) => ({ label: path.basename(template), value: template, description: template, picked: true })),
    {
      title: 'Templates',
      placeHolder: 'Please select a template',
      canPickMany: true,
      ignoreFocusOut: true
    }
  );
};

export async function selectTemplateFiles(files: string[], templatePath: string, context: Context) {
  const templateName = context.templateName;

  const options = files.map((file) => ({
    label: path.basename(file),
    value: file,
    description: path.relative(templatePath, file),
    picked: true
  }));

  if (!context.promptTemplateFiles) return options;

  return vscode.window.showQuickPick(options, {
    title: `${caseConverter._toPascalCase(templateName)} - File Templates`,
    placeHolder: 'Please pick template files to generate',
    canPickMany: true,
    ignoreFocusOut: true,
    matchOnDescription: true,
    matchOnDetail: true
  });
}

export const getInput = async (
  inputName: string,
  inputConfig: InputConfig = {} as InputConfig,
  context: Context,
  transform?: (input?: string) => string | undefined
) => {
  const getTitle = () => {
    const baseTitle = `${context.templateName} - ${inputConfig.title || caseConverter._toTitleCase(inputName)}`;
    return context.relativeTemplateFile ? `${baseTitle} - ${context.relativeTemplateFile}` : baseTitle;
  };

  const transformValue = (value: any) => {
    if (inputConfig.transform) {
      if (typeof inputConfig.transform === 'string' && inputConfig.transform.length > 0)
        return interpolate(inputConfig.transform, { ...context, value });
      else if (typeof inputConfig.transform === 'function') return inputConfig.transform(value, context);
    }
    if (transform) return transform(value);
    return value;
  };

  const getQuickPickValue = async () => {
    const picked: unknown = await vscode.window.showQuickPick(inputConfig.options as vscode.QuickPickItem[], {
      placeHolder: `Please enter a ${inputName}`,
      canPickMany: false,
      ignoreFocusOut: true,
      ...inputConfig,
      title: getTitle()
    });

    if (picked === undefined) return;

    const value = isPlainObject(picked) ? picked.value : isArray(picked) ? picked.map((pick) => pick.value) : picked;
    return transformValue(value);
  };

  const validateInput = (value: any) => {
    if (!inputConfig.validateInput) return;
    if (typeof inputConfig.validateInput === 'string' && inputConfig.validateInput.length > 0)
      return interpolate(inputConfig.validateInput, { ...context, value });
    else if (typeof inputConfig.validateInput === 'function') return inputConfig.validateInput(value, context);
  };

  const getInputBoxValue = async () => {
    const input = await vscode.window.showInputBox({
      placeHolder: `Please enter a ${inputName}`,
      ignoreFocusOut: true,
      ...inputConfig,
      title: getTitle(),
      validateInput
    });

    if (input === undefined) return;

    const value = input.trim();
    return transformValue(value);
  };

  return inputConfig.options?.length ? getQuickPickValue() : getInputBoxValue();
};

export async function shouldSkipFile(outputFile: string, shouldOverwriteExistingFile = Settings.shouldOverwriteExistingFile) {
  if (!fsx.existsSync(outputFile) || shouldOverwriteExistingFile) return false;

  const actions = ['Always Overwrite Existing Files', 'Overwrite this file', 'Skip this file'];
  const selectedAction = await vscode.window.showErrorMessage(
    `${path.basename(outputFile)} file already exists.`,
    { modal: true },
    ...actions
  );

  if (!selectedAction) throw Error(EXIT);
  if (selectedAction === actions[2]) return true;
  if (selectedAction === actions[0]) Settings.shouldOverwriteExistingFile = true;
  return false;
}
