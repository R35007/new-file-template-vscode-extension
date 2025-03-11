import fg from 'fast-glob';
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
  const convertToMethodName = Object.keys(context.Case || {}).find((methodName) => inputNameString.endsWith(methodName)) as
    | keyof typeof context.Case
    | undefined;

  const transform = convertToMethodName ? (context.Case?.[convertToMethodName] as (input?: string) => string | undefined) : undefined;
  const inputName = convertToMethodName ? inputNameString.replace(convertToMethodName, '').trim() : inputNameString;

  return { transform, inputName, convertToMethodName };
};

export const getCurrentTemplateFile = (context?: Partial<Context>) => {
  if (!context) return;
  return context.relativeTemplateFileToTemplate
    ? `${context.templateName}/${context.relativeTemplateFileToTemplate}`
    : context.templateName;
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
      const currentTemplateFile = getCurrentTemplateFile(context);
      const message = currentTemplateFile ? `${currentTemplateFile} - ${error.message}` : error.message;
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
      const currentTemplateFile = getCurrentTemplateFile(context);
      const message = currentTemplateFile ? `${currentTemplateFile} - ${error.message}` : error.message;
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

export function shouldExit(err: unknown, context?: Partial<Context>, log?: (message: string) => void) {
  if (err instanceof Error && err.message === EXIT) {
    log?.('[EXIT] Exiting with a smile! 😊');
    return true;
  }
  if (err instanceof Error && err.message !== EXIT) {
    const currentTemplateFile = getCurrentTemplateFile(context);
    const message = currentTemplateFile ? `${currentTemplateFile} - ${err.message}` : err.message;
    vscode.window.showErrorMessage(message);
    log?.(`[ERROR] ${message}`);
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
      if ((shouldExit(err), context)) throw Error(EXIT);
    }
  }

  if (!data) {
    try {
      data = await fsx.readFile(templateFile, 'utf8');
    } catch (err) {
      if ((shouldExit(err), context)) throw Error(EXIT);
    }
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

export const formatTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
  return `[${formattedHours}:${minutes}:${seconds}.${milliseconds}]`;
};

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
