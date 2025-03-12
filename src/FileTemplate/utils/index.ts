import fg from 'fast-glob';
import * as fsx from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Context, EXIT } from '../../types';
import { getWorkSpaceFolder } from './pathDetails';

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
  const convertToMethodName = Object.keys(context.Case || {}).find((methodName) => inputNameString.endsWith(methodName)) as
    | keyof typeof context.Case
    | undefined;

  const transform = convertToMethodName ? (context.Case?.[convertToMethodName] as (input?: string) => string | undefined) : undefined;
  const inputName = convertToMethodName ? inputNameString.replace(convertToMethodName, '').trim() : inputNameString;

  return { transform, inputName, convertToMethodName };
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

export function mergeContext(existingContext: Partial<Context> = {}, newContext: Partial<Context> = {}) {
  const variables = { ...existingContext.variables, ...newContext.variables };
  const inputValues = { ...existingContext.inputValues, ...newContext.inputValues };
  const input = { ...existingContext.input, ...newContext.input, ...inputValues };

  Object.assign(existingContext, {
    ...newContext,
    ...variables,
    ...inputValues,
    input,
    variables,
    inputValues
  });

  return existingContext;
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
    delete require.cache[require.resolve(templateFile)];
    const module = require(templateFile);
    data = typeof module === 'function' ? await module(context) : JSON.stringify(module, null, 2);
  }

  if (!data) {
    data = await fsx.readFile(templateFile, 'utf8');
  }

  return data;
}

export function getValueFromCallback(callback: unknown | ((context: Context) => string[]) = [], context: Context, isList?: boolean) {
  if (!callback) return isList ? [] : callback;
  const value = typeof callback === 'function' ? callback(context) : callback;
  return isList ? (isArray(value) ? [...new Set(value)] : []) : value;
}

export function shouldOpenGeneratedFile(context: Context): boolean {
  if (typeof context.openAfterGeneration === 'boolean') return context.openAfterGeneration;
  const openGeneratedFilesList = getValueFromCallback(context.openAfterGeneration, context, true);
  return openGeneratedFilesList.some(
    (pattern: string) => pattern === context.templateFileName || new RegExp(pattern).test(context.templateFileName!)
  );
}

export const getRegexValues = (data: string, patternString: string) => {
  const regex = new RegExp(patternString, 'g'); // Add the 'g' flag
  let match;
  const results = [];

  // Use a loop to extract all matches with the capturing group
  while ((match = regex.exec(data)) !== null) {
    results.push(match[1]); // Capture group 1 contains the text between __
  }

  return results;
};

export function handleError(error: any, context?: Partial<Context>, errorMessage?: string) {
  if (error instanceof Error && error.message === EXIT) {
    const message = '[EXIT] Goodbye! May your code be bug-free and your coffee strong! ☕';
    if (message === errorMessage) return errorMessage;

    context?.log?.(message, '\n');
    return message;
  }
  console.error(error);
  if (error instanceof Error) {
    const message = context?.currentTemplateFile ? `${error.message} - ${context?.currentTemplateFile}` : error.message;
    if (message === errorMessage) return errorMessage;
    context?.log?.(`[ERROR] ${message}`);
    context?.log?.(`[ERROR] ${error.stack}`);
    vscode.window.showErrorMessage(message);
    return message;
  }
}
