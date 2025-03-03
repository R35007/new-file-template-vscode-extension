import fg from 'fast-glob';
import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Settings } from './Settings';
import * as caseConverter from './caseConverter';
import { Commands, EXIT_CODE, InputConfig, TemplateConfig } from './constants';

const getTopLevelFolders = async (folderPaths: string[]) => {
  const folderPromises = folderPaths.map(async (folderPath) =>
    fg(`${folderPath.replace(/\\/g, '/')}/*`, {
      onlyDirectories: true,
      deep: 1
    })
  );
  const folders = await Promise.all(folderPromises);
  return folders.flat();
};

export const pickTemplateFolders = async () => {
  const folders = await getTopLevelFolders(Settings.templatePaths);
  // If there is not template prompt to Create a template
  if (!folders?.length) {
    const action = 'Create New Sample Template';
    vscode.window
      .showErrorMessage(
        `No Templates Found ! 
        Click the below button to create a new sample template.`,
        { modal: true },
        action
      )
      .then((selectedAction) => {
        if (selectedAction !== action) {
          throw Error(EXIT_CODE);
        }
        vscode.commands.executeCommand(Commands.CREATE_SAMPLE_TEMPLATE);
      });

    return;
  }

  return vscode.window.showQuickPick(
    folders.map((folder) => ({ label: path.basename(folder), value: folder, description: folder, picked: true })),
    {
      title: 'Templates',
      placeHolder: 'Please select a template',
      canPickMany: true,
      ignoreFocusOut: true
    }
  );
};

export const getTemplateConfig = async (templatePath: string = Settings.vscodeTemplatePath) => {
  try {
    const configName = Settings.configName || '_config';
    const jsonConfigPath = path.join(templatePath, `${configName}.json`);
    const jsConfigPath = path.join(templatePath, `${configName}.js`);
    const configFolderPath = path.join(templatePath, configName);
    const indexJsPath = path.join(configFolderPath, 'index.js');

    // Check if JSON config file exists
    if (fsx.existsSync(jsonConfigPath)) {
      const jsonContent = await fsx.readFile(jsonConfigPath, 'utf8');
      return JSON.parse(jsonContent) as TemplateConfig;
    }

    // Check if JS config file exists
    else if (fsx.existsSync(jsConfigPath)) {
      delete require.cache[jsConfigPath];
      const jsModule = require(jsConfigPath);
      if (typeof jsModule === 'function') {
        return jsModule() as TemplateConfig;
      }
    }

    // Check if index.js in config folder exists
    else if (fsx.existsSync(indexJsPath)) {
      delete require.cache[indexJsPath];
      const indexModule = require(indexJsPath);
      if (typeof indexModule === 'function') {
        return indexModule() as TemplateConfig;
      }
    }
  } catch (error) {
    error instanceof Error && vscode.window.showErrorMessage(error.message);
    console.error(error);
  }
};

export const isPlainObject = (val?: any): val is Record<string, any> => !!(val && typeof val === 'object' && !Array.isArray(val));
export const isArray = (val?: any): val is any[] => !isPlainObject(val) && Array.isArray(val);

export const getWorkSpaceFolder = (filePath: string = '') => {
  const activePath: string = filePath.replace(/\\/g, '/') || '';
  const workspaceFolders = vscode.workspace.workspaceFolders || [];

  if (!activePath?.trim().length) return workspaceFolders[0]?.uri.fsPath.replace(/\\/g, '/') || './';

  return workspaceFolders.map((folder) => folder.uri.fsPath).find((folder) => activePath.includes(folder.replace(/\\/g, '/'))) || './';
};

const handleUndefinedVariable = (error: Error, format: string = '', object: Record<string, any> = {}) => {
  const undefinedVariable = error.message.replace('is not defined', '').trim();

  const convertToMethodName = Object.keys(caseConverter).find((methodName) =>
    undefinedVariable.endsWith(methodName)
  ) as keyof typeof caseConverter;

  const transform = convertToMethodName && (caseConverter[convertToMethodName] as (input?: string) => string | undefined);
  const inputName = !!transform ? undefinedVariable.replace(convertToMethodName, '').trim() : undefinedVariable;

  const key = !!transform ? `${inputName}${convertToMethodName}` : inputName;
  const value = isPlainObject(object.input[inputName]) ? object.input[inputName].value : object.input[inputName];

  if (value === undefined || typeof value !== 'string') {
    vscode.window.showErrorMessage(error.message);
    console.error(error);
    throw Error(EXIT_CODE);
  }

  return interpolate(format, {
    ...object,
    [key]: !!transform ? transform(value) : value
  });
};

// Helps to convert template literal strings to applied values.
export const interpolate = (format: string = '', object: Record<string, any> = {}): string => {
  try {
    const keys = Object.keys(object);
    const values = Object.values(object);
    const interpolatedFunction = new Function(...keys, `return \`${format}\`;`);
    return interpolatedFunction(...values);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.endsWith('is not defined')) {
      return handleUndefinedVariable(error, format, object);
    }
    const errorMessage = error instanceof Error ? error.message : `${error}`;
    vscode.window.showErrorMessage(errorMessage);
    console.error(error);
    throw Error(EXIT_CODE);
  }
};

export const getTemplateName = () =>
  vscode.window.showInputBox({
    title: 'Template Name',
    value: 'React Component',
    ignoreFocusOut: true,
    placeHolder: 'Please enter the template name'
  });

export const getInput = async (inputName: string, inputConfig: InputConfig = {} as InputConfig, config: TemplateConfig) => {
  if (inputConfig.options?.length) {
    const picked: any = await vscode.window.showQuickPick(inputConfig.options as vscode.QuickPickItem[], {
      placeHolder: `Please enter a ${inputName}`,
      canPickMany: false,
      ignoreFocusOut: true,
      ...inputConfig,
      title: config.templateFileBaseName
        ? `${config.templateName} - ${config.templateFileBaseName} - ${caseConverter._toTitleCase(inputConfig.title || inputName)}`
        : `${config.templateName} - ${caseConverter._toTitleCase(inputConfig.title || inputName)}`
    });

    if (picked === undefined) return;

    const value = isPlainObject(picked) ? picked.value?.trim() : isArray(picked) ? picked.map((pick) => pick.value) : picked?.trim();
    return inputConfig.transform
      ? inputConfig.transform(value, config as TemplateConfig)
      : inputConfig.afterInput?.trim().length
        ? interpolate(inputConfig.afterInput, { ...config, value })
        : value;
  }

  const validateInput = (value: any) => {
    if (inputConfig.validateInput) return inputConfig.validateInput?.(value, config as TemplateConfig);
    else if (inputConfig.validator?.trim().length) return interpolate(inputConfig.validator, { ...config, value });
    return;
  };

  const input = await vscode.window.showInputBox({
    placeHolder: `Please enter a ${inputName}`,
    ignoreFocusOut: true,
    ...inputConfig,
    title: config.templateFileBaseName
      ? `${config.templateName} - ${config.templateFileBaseName} - ${caseConverter._toTitleCase(inputConfig.title || inputName)}`
      : `${config.templateName} - ${caseConverter._toTitleCase(inputConfig.title || inputName)}`,
    validateInput,
    value: inputConfig.value || inputConfig.title
  });

  if (input === undefined) return;

  const value = input?.trim();
  return inputConfig.transform
    ? inputConfig.transform(value, config as TemplateConfig)
    : inputConfig.afterInput?.trim().length
      ? interpolate(inputConfig.afterInput, { ...config, value })
      : value;
};

async function listNestedFiles(folder: string, excludes: string[]): Promise<string[]> {
  const formattedExclude = excludes.map((item) => {
    const resolvedPath = path.resolve(folder, item).replace(/\\/g, '/');
    return fsx.existsSync(resolvedPath) && fsx.statSync(resolvedPath).isDirectory() ? `${resolvedPath}/**` : resolvedPath;
  });
  const files = await fg([`${folder.replace(/\\/g, '/')}/**/*`], {
    ignore: formattedExclude,
    onlyFiles: true
  });
  return files;
}

export const selectTemplateFiles = async (templatePath: string, templateName: string, exclude: string[] = []) => {
  const files = await listNestedFiles(templatePath, [
    `${templatePath}/${Settings.configName}`,
    `${templatePath}/${Settings.configName}.json`,
    `${templatePath}/${Settings.configName}.js`,
    ...exclude
  ]);

  const options = files.map((file) => ({
    label: path.basename(file),
    value: file,
    description: path.relative(templatePath, file),
    picked: true
  }));

  if (!Settings.promptTemplateFiles) return options;

  return vscode.window.showQuickPick(options, {
    title: `${caseConverter._toPascalCase(templateName)} - File Templates`,
    placeHolder: 'Please pick template files to generate',
    canPickMany: true,
    ignoreFocusOut: true,
    matchOnDescription: true,
    matchOnDetail: true
  });
};

export const resolveWithWorkspaceFolder = (relativePath: string) => {
  const workspaceFolder = getWorkSpaceFolder();
  return path.resolve(workspaceFolder, relativePath);
};

export const mergeConfig = (config: TemplateConfig = {} as TemplateConfig, templateConfig: TemplateConfig = {} as TemplateConfig) =>
  ({
    ...config,
    ...templateConfig,
    input: { ...config.input, ...templateConfig.input },
    variables: { ...config.variables, ...templateConfig.variables }
  }) as TemplateConfig;
