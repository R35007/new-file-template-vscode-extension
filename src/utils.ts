import fg from 'fast-glob';
import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import * as caseConverter from './caseConverter';
import { getWorkSpaceFolder } from './pathDetails';
import { Context, EXIT } from './types';

export function getTopLevelFolders(folderPaths: string[]): Promise<string[]> {
  const folderPromises = folderPaths.map((folderPath) =>
    fg(`${folderPath.replace(/\\/g, '/')}/*`, {
      onlyDirectories: true,
      deep: 1
    })
  );
  return Promise.all(folderPromises).then((folders) => folders.flat());
}

export async function getTemplateConfig(templatePath: string, configName = '_config', context?: Context): Promise<Context | undefined> {
  const jsonConfigPath = path.join(templatePath, `${configName}.json`);
  const jsConfigPath = path.join(templatePath, `${configName}.js`);
  const configFolderPath = path.join(templatePath, configName);
  const indexJsPath = path.join(configFolderPath, 'index.js');

  // Check if JSON config file exists
  if (fsx.existsSync(jsonConfigPath)) {
    try {
      const jsonContent = await fsx.readFile(jsonConfigPath, 'utf8');
      return JSON.parse(jsonContent) as Context;
    } catch (err) {
      if (err instanceof Error) vscode.window.showErrorMessage(`${jsonConfigPath} - ${err.message}`);
      else throw err;
    }
  }

  // Check if JS config file exists
  if (fsx.existsSync(jsConfigPath)) {
    try {
      delete require.cache[jsConfigPath];
      const jsModule = require(jsConfigPath);
      if (typeof jsModule === 'function') return jsModule(context) as Context;
    } catch (err) {
      if (err instanceof Error) vscode.window.showErrorMessage(`${jsConfigPath} - ${err.message}`);
      else throw err;
    }
  }

  // Check if index.js in config folder exists
  if (fsx.existsSync(indexJsPath)) {
    try {
      delete require.cache[indexJsPath];
      const indexModule = require(indexJsPath);
      if (typeof indexModule === 'function') return indexModule() as Context;
    } catch (err) {
      if (err instanceof Error) vscode.window.showErrorMessage(`${indexJsPath} - ${err.message}`);
      else throw err;
    }
  }
}

export const isPlainObject = (val?: any): val is Record<string, any> => !!(val && typeof val === 'object' && !Array.isArray(val));
export const isArray = (val?: any): val is any[] => !isPlainObject(val) && Array.isArray(val);

const handleUndefinedVariable = (error: Error, format: string = '', object: Record<string, any> = {}) => {
  const undefinedVariable = error.message.replace('is not defined', '').trim();

  const convertToMethodName = Object.keys(caseConverter).find((methodName) =>
    undefinedVariable.endsWith(methodName)
  ) as keyof typeof caseConverter;

  const transform = convertToMethodName && (caseConverter[convertToMethodName] as (input?: string) => string | undefined);
  const inputName = !!transform ? undefinedVariable.replace(convertToMethodName, '').trim() : undefinedVariable;

  const key = !!transform ? `${inputName}${convertToMethodName}` : inputName;
  const value =
    object.inputValues[inputName] ||
    object.variables[inputName] ||
    (isPlainObject(object.input[inputName]) ? object.input[inputName].value : object.input[inputName]);

  if (value === undefined || typeof value !== 'string') throw Error(`variable: ${error.message}`);

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
    if (error instanceof Error && error.message.endsWith('is not defined')) return handleUndefinedVariable(error, format, object);
    throw error;
  }
};

export async function listNestedFiles(folder: string, excludes: string[]): Promise<string[]> {
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

export const resolveWithWorkspaceFolder = (relativePath: string) => {
  const workspaceFolder = getWorkSpaceFolder();
  return path.resolve(workspaceFolder, relativePath);
};

export function mergeContext(existingContext: Context = {} as Context, newContext: Context = {} as Context) {
  const variables = { ...existingContext.variables, ...newContext.variables };
  const inputValues = { ...existingContext.inputValues, ...newContext.inputValues };
  const input = { ...existingContext.input, ...newContext.input, ...inputValues };

  return {
    ...existingContext,
    ...newContext,
    input,
    variables,
    inputValues,
    ...variables,
    ...inputValues
  };
}

export function shouldExit(err: unknown, currentTemplateFile?: string) {
  if (err instanceof Error && err.message === EXIT) return true;
  if (err instanceof Error && err.message !== EXIT) {
    const message = currentTemplateFile ? `${currentTemplateFile} - ${err.message}` : err.message;
    vscode.window.showErrorMessage(message);
  }
  console.error(err);
}

export function getOutputFilePath(templatePath: string, destinationPath: string, parsedTemplatePaths: string) {
  let outputFile = path.join(destinationPath, path.relative(templatePath, parsedTemplatePaths));
  const shouldRequire = path.basename(outputFile).endsWith('.template.js');
  return shouldRequire ? outputFile.replace(/\.template\.js$/, '') : outputFile;
}

export async function getTemplateData(templateFile: string, context: Context) {
  let data = '';
  const shouldRequire = path.basename(templateFile).endsWith('.template.js');

  if (shouldRequire) {
    try {
      delete require.cache[require.resolve(templateFile)];
      const module = require(templateFile);
      data = typeof module === 'function' ? await module(context) : JSON.stringify(module, null, 2);
    } catch (err) {
      console.log(err);
    }
  }

  if (!data) {
    try {
      data = await fsx.readFile(templateFile, 'utf8');
    } catch (err) {
      console.log(err);
    }
  }

  return data;
}

export function getExcludes(context: Context) {
  if (!context.exclude) return [];
  const excludes = typeof context.exclude === 'function' ? context.exclude(context) : context.exclude;
  return isArray(excludes) ? excludes : [];
}
