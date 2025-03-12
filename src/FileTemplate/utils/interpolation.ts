import { handleError, isPlainObject, parseInputTransformVariable } from '.';
import { Settings } from '../../Settings';
import { Context } from '../../types';

/**
 * Handles an error caused by an undefined variable during interpolation.
 *
 * Step 1: get the error: Ex: componentName_toPascalCase is not defined
 * Step 2: split the variable name and Case function as `componentName` and `_toPascalCase`
 * Step 3: Check is `componentName` value is present,
 * Step 4:    if yes then convert the value to the given case and add it to the context: ex: componentName_toPascalCase: _toPascalCase(componentName) and recall the interpolation with the new context.
 * Step 5:    if no then throw the error. // In feature we can also prompt the user input if the variable is undefined.
 */
export const handleUndefinedVariable = (error: Error, format: string = '', context: Context = {} as Context) => {
  const undefinedVariable = error.message.replace('is not defined', '').trim();

  const { transform, inputName, convertToMethodName } = parseInputTransformVariable(undefinedVariable, context);

  const key = !!transform ? `${inputName}${convertToMethodName}` : inputName;
  const value =
    context.inputValues[inputName] ||
    context.variables[inputName] ||
    (isPlainObject(context.input[inputName]) ? context.input[inputName].value : context.input[inputName]);

  if (value === undefined || typeof value !== 'string') {
    !Settings.disableInterpolationErrorMessage && handleError(error, context);
    return format;
  }

  return interpolateFormat(format, { ...context, [key]: !!transform ? transform(value) : value });
};

export const interpolateFormat = (format: string = '', context: Context = {} as Context): string => {
  try {
    const keys = Object.keys(context);
    const values = Object.values(context);
    const interpolatedFunction = new Function(...keys, `return \`${format}\`;`);
    return interpolatedFunction(...values);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.endsWith('is not defined')) return handleUndefinedVariable(error, format, context);
    !Settings.disableInterpolationErrorMessage && handleError(error, context);
    return format;
  }
};

export const interpolateTemplate = (template: string = '', context: Context = {} as Context): string => {
  const templateList = Settings.interpolateByLine ? template.split(/\r\n|\n/g) : [template];
  return templateList.map((string) => interpolateFormat(string, context)).join('\n');
};
