import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { getValueFromCallback, isCollection, isPlainObject } from '.';
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

export const getTemplatePath = async (templatePaths: string[]) => {
  const picked = await vscode.window.showQuickPick(
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

  if (!picked) throw Error(EXIT);

  return picked.value;
};

export const getExampleTemplatePath = async () => {
  const exampleTemplates = [
    { label: 'Advanced', value: '12. Advanced', description: 'A collection of templates showcasing advanced features and techniques.' },
    { label: 'Simple', value: '1. Simple', description: 'A straightforward and basic template example.' },
    { label: 'Using Template JS', value: '2. Using Template JS', description: 'An example utilizing JavaScript templates.' },
    {
      label: 'Using Template JS with Config',
      value: '3. Using Template JS with Config',
      description: 'A template example using JavaScript with configuration options.'
    },
    {
      label: 'Escaping BackTicks',
      value: '4. Escaping BackTicks',
      description: 'An example demonstrating the escape of backticks in templates.'
    },
    {
      label: 'Prompt Inputs on Demand',
      value: '5. Prompt Inputs on Demand',
      description: 'An example showcasing how to prompt inputs dynamically.'
    },
    {
      label: 'Input Configurations',
      value: '6. Input Configurations',
      description: 'A template example with various input configuration options.'
    },
    { label: 'Hooks', value: '7. Hooks', description: 'An example illustrating the usage of hooks in templates.' },
    {
      label: 'Find and Replace',
      value: '8. Find and Replace',
      description: 'An example demonstrating the find-and-replace functionality within templates.'
    },
    {
      label: 'Generate Template Multiple Times',
      value: '9. Generate Template Multiple Times',
      description: 'An example of generating a template multiple times for different scenarios.'
    },
    {
      label: 'Generate Multiple Output Files',
      value: '10. Generate Multiple Output Files',
      description: 'An example of creating multiple output files from a single template.'
    },
    {
      label: 'Snippet Generation',
      value: '11. Snippet Generation',
      description: 'An example focusing on generating small code snippets or segments.'
    },
    { label: 'Create All', value: 'Create All', description: 'A convenient option for generating all templates at once.' }
  ];

  const picked = await vscode.window.showQuickPick(exampleTemplates, {
    title: 'Example Templates',
    ignoreFocusOut: true,
    matchOnDescription: true,
    matchOnDetail: true,
    placeHolder: 'Please pick a sample template'
  });

  if (!picked) throw Error(EXIT);

  return picked;
};

export const getTemplateName = async (templatePath: string, defaultName: string) => {
  const value = await vscode.window.showInputBox({
    title: 'Template Name',
    value: defaultName,
    ignoreFocusOut: true,
    placeHolder: 'Please enter the template name',
    validateInput: (value) =>
      fsx.existsSync(path.join(templatePath, value)) ? 'Template already exist. Please provide a different name.' : undefined
  });

  if (!value) throw Error(EXIT);

  return value;
};

export const pickTemplateFolders = async (templates: string[]): Promise<string[]> => {
  const picked = await vscode.window.showQuickPick(
    templates
      .map((template) => ({ label: path.basename(template), value: template, description: template, picked: true }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label)),
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

    const value = inputConfig.canPickMany
      ? isCollection(picked)
        ? picked.map((p) => p.value)
        : picked
      : isPlainObject(picked)
        ? picked.value
        : picked;
    return transformValue(value);
  };

  const validateInput = (value: any) => {
    if (inputConfig.pattern?.trim().length) {
      const pattern = new RegExp(inputConfig.pattern);
      return pattern.test(value) ? undefined : 'Invalid pattern';
    }

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
