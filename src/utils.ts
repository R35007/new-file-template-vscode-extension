import fg, { glob } from 'fast-glob';
import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
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

export const isPlainObject = (val?: any): val is Record<string, any> => !!(val && typeof val === 'object' && !Array.isArray(val));
export const isArray = (val?: any): val is any[] => !isPlainObject(val) && Array.isArray(val);

export const parseInputTransformVariable = (inputNameString: string, context: Context) => {
  const convertToMethodName = Object.keys(context.case || {}).find((methodName) => inputNameString.endsWith(methodName)) as
    | keyof typeof context.case
    | undefined;

  const transform = convertToMethodName ? (context.case?.[convertToMethodName] as (input?: string) => string | undefined) : undefined;
  const inputName = convertToMethodName ? inputNameString.replace(convertToMethodName, '').trim() : inputNameString;

  return { transform, inputName, convertToMethodName };
};

const handleUndefinedVariable = (
  error: Error,
  format: string = '',
  context: Context = {} as Context,
  hideErrorMessage: boolean = false
) => {
  const undefinedVariable = error.message.replace('is not defined', '').trim();

  const { transform, inputName, convertToMethodName } = parseInputTransformVariable(undefinedVariable, context);

  const key = !!transform ? `${inputName}${convertToMethodName}` : inputName;
  const value =
    context.inputValues[inputName] ||
    context.variables[inputName] ||
    (isPlainObject(context.input[inputName]) ? context.input[inputName].value : context.input[inputName]);

  if (value === undefined || typeof value !== 'string') {
    if (error instanceof Error && !hideErrorMessage) {
      const message = context.currentTemplateFile ? `${context.currentTemplateFile} - ${error.message}` : error.message;
      vscode.window.showErrorMessage(message);
    }
    return format;
  }

  return interpolate(format, { ...context, [key]: !!transform ? transform(value) : value });
};

// Helps to convert template literal strings to applied values.
export const interpolate = (format: string = '', context: Context = {} as Context, hideErrorMessage: boolean = false): string => {
  try {
    const keys = Object.keys(context);
    const values = Object.values(context);
    const interpolatedFunction = new Function(...keys, `return \`${format}\`;`);
    return interpolatedFunction(...values);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.endsWith('is not defined'))
      return handleUndefinedVariable(error, format, context, hideErrorMessage);
    if (error instanceof Error && !hideErrorMessage) {
      const message = context.currentTemplateFile ? `${context.currentTemplateFile} - ${error.message}` : error.message;
      vscode.window.showErrorMessage(message);
    }
    return format;
  }
};

const getFormattedPatternPaths = (folder: string, paths: string[]) =>
  paths.filter(Boolean).map((item) => {
    const resolvedPath = path.resolve(folder, item).replace(/\\/g, '/');
    return fsx.existsSync(resolvedPath) && fsx.statSync(resolvedPath).isDirectory() ? `${resolvedPath}/**/*` : resolvedPath;
  });

export async function listNestedFiles(folder: string, excludes: string[] = [], includes: string[] = []): Promise<string[]> {
  const formattedExclude = getFormattedPatternPaths(folder, excludes);
  const formattedInclude = getFormattedPatternPaths(folder, includes);
  const files = await fg(formattedInclude.length ? formattedInclude : [`${folder.replace(/\\/g, '/')}/**/*`], {
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
      if (err instanceof Error) {
        const message = context.currentTemplateFile ? `${context.currentTemplateFile} - ${err.message}` : err.message;
        vscode.window.showErrorMessage(message);
      }
      console.log(err);
    }
  }

  if (!data) {
    try {
      data = await fsx.readFile(templateFile, 'utf8');
    } catch (err) {
      if (err instanceof Error) {
        const message = context.currentTemplateFile ? `${context.currentTemplateFile} - ${err.message}` : err.message;
        vscode.window.showErrorMessage(message);
      }
      console.log(err);
    }
  }

  return data;
}

export function getListFromCallback(callback: string[] | ((context: Context) => string[]) = [], context: Context) {
  if (!callback) return [];
  const list = typeof callback === 'function' ? callback(context) : callback;
  return isArray(list) ? list : [];
}

export function shouldOpenGeneratedFile(context: Context): boolean {
  if (typeof context.openAfterGeneration === 'boolean') return context.openAfterGeneration;
  const openGeneratedFilesList = getListFromCallback(context.openAfterGeneration, context);
  return openGeneratedFilesList.some(
    (pattern) => pattern === context.templateFileName || new RegExp(pattern).test(context.templateFileName!)
  );
}
