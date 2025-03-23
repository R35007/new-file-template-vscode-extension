module.exports = {
  /**
   * Executes before generating all template files.
   * You can return a modified context to proceed, `false` to skip the process, or leave it unchanged to continue as is.
   */
  beforeAll: (context) => {
    // As an alternative to include/exclude logic, you can update the `templateFiles` paths list here.
    return {
      templateFiles: context.templateFiles // Sort, filter, or update the `templateFiles` list as needed.
    };
  },
  /**
   * Executes before generating each template file.
   * You can return a modified context to proceed, `false` to skip the process, or leave it unchanged to continue as is.
   */
  beforeEach: (context) => {
    return {
      outputFile: context.outputFile, // Specify a custom output file path here if needed.
      camelCaseComponentName: context._toCamelCase(context.componentName) // Convert the component name to camel case.
    };
  },
  /**
   * Processes data before interpolation for each file.
   * The `data` parameter is always a string. You can return updated `data` and/or a modified context to proceed, `false` to skip, or leave it unchanged to continue as is.
   */
  processBeforeEach: ({ data, context }) => ({ data, context }),
  /**
   * Processes data after interpolation for each file.
   * The `data` parameter is always a string. You can return updated `data` and/or a modified context to proceed, `false` to skip, or leave it unchanged to continue as is.
   */
  processAfterEach: ({ data, context }) => {
    const updatedData = data.replace(/__componentName__/g, context._toPascalCase(context.componentName));

    // Return the updated data or context to proceed.
    return { data: updatedData, context };
  },
  /**
   * Executes after generating each template file.
   * You can return a modified context to proceed, `false` to skip, or leave it unchanged to continue as is.
   */
  afterEach: (context) => context,
  /**
   * Executes after generating all template files.
   * You can return a modified context to proceed, `false` to skip, or leave it unchanged to continue as is.
   */
  afterAll: (context) => context
};
