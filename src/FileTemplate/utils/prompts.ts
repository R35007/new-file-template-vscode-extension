import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { getValueFromCallback, isArray, isPlainObject } from '.';
import { Settings } from '../../Settings';
import { Commands, Context, EXIT, InputConfig } from '../../types';
import { interpolateFormat } from './interpolation';

export const promptToCreateNewSampleTemplate = async () => {
  const selectedAction = await vscode.window.showInformationMessage(
    `No templates found. Would you like to create a new sample template ?`,
    { modal: true },
    'Yes'
  );

  if (selectedAction === 'Yes') vscode.commands.executeCommand(Commands.CREATE_SAMPLE_TEMPLATE);
  return;
};

export const getTemplatePath = (templatePaths: string[]) =>
  vscode.window.showQuickPick(
    templatePaths.map((tPath) => ({
      label: path.basename(tPath),
      value: tPath,
      description: tPath
    })),
    {
      title: 'Template Paths',
      ignoreFocusOut: true,
      matchOnDescription: true,
      matchOnDetail: true,
      placeHolder: 'Please pick a template path to create a new sample template'
    }
  );

export const getTemplateName = (templatePath: string) =>
  vscode.window.showInputBox({
    title: 'Template Name',
    value: 'React_Component',
    ignoreFocusOut: true,
    placeHolder: 'Please enter the template name',
    validateInput: (value) =>
      fsx.existsSync(path.join(templatePath, value)) ? 'Template already exist. Please provide a different name.' : undefined
  });

export const pickTemplateFolders = async (templates: string[]): Promise<string[]> => {
  const picked = await vscode.window.showQuickPick(
    templates.map((template) => ({ label: path.basename(template), value: template, description: template, picked: true })),
    {
      title: 'Templates',
      placeHolder: 'Please select a template',
      canPickMany: Settings.promptMultipleTemplates,
      matchOnDescription: true,
      matchOnDetail: true,
      ignoreFocusOut: true
    }
  );

  if (picked === undefined) return [];
  const result = Array.isArray(picked) ? picked : [picked];
  return result.map((item) => item.value);
};

export async function selectTemplateFiles(files: string[], templatePath: string, context: Context) {
  const templateName = context.templateName;

  const options = files.map((file) => ({
    label: path.basename(file),
    value: file,
    description: path.relative(templatePath, file),
    picked: true
  }));

  if (!(await getValueFromCallback(context.promptTemplateFiles, context))) return options;

  return vscode.window.showQuickPick(options, {
    title: `${context.Case?._toPascalCase?.(templateName)} - File Templates`,
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
    const baseTitle = inputConfig.title || context.Case?._toTitleCase(inputName);
    return context.currentTemplateFile ? `${baseTitle} - ${context.currentTemplateFile}` : `${baseTitle} - ${context.templateName}`;
  };

  const transformValue = (value: any) => {
    if (inputConfig.transform) {
      if (typeof inputConfig.transform === 'string' && inputConfig.transform.length > 0)
        return interpolateFormat(inputConfig.transform, { ...context, value });
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
      return interpolateFormat(inputConfig.validateInput, { ...context, value });
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

export async function shouldSkipFile(outputFile: string, context: Context, log?: (message: string) => void) {
  if (!fsx.existsSync(outputFile)) return false;

  const overwriteExistingFile = await getValueFromCallback(context.overwriteExistingFile, context);

  if (overwriteExistingFile === 'never') {
    log?.(`Skipping file (never overwrite): ${outputFile}`);
    return true; // if true skip the file
  }

  if (overwriteExistingFile === 'always') {
    log?.(`Overwriting file (always overwrite): ${outputFile}`);
    return false; // if false overwrite the file
  }

  log?.('Prompting user for action: file already exists, asking whether to overwrite or skip files...');

  const actions = [`Overwrite all Existing Files`, `Skip all Existing Files`, 'Overwrite this file', 'Skip this file'];
  const selectedAction = await vscode.window.showWarningMessage(
    `${path.basename(outputFile)} file already exists.`,
    { modal: true },
    ...actions
  );

  if (!selectedAction) {
    log?.('No action selected, exiting');
    throw Error(EXIT);
  }

  log?.(`User chose to: ${selectedAction}`);

  if (selectedAction === actions[3]) {
    log?.(`Skipping file: ${outputFile}`);
    return true;
  }

  if (selectedAction === actions[0]) {
    context.overwriteExistingFile = 'always';
    log?.(`Overwriting all files`);
    return false;
  }
  if (selectedAction === actions[1]) {
    context.overwriteExistingFile = 'never';
    log?.(`Skipping all files`);
    return true;
  }
  log?.(`Overwriting file: ${outputFile}`);
  return false;
}
