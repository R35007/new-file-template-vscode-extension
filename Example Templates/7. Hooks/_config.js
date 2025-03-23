/**
 * Configuration file demonstrating available features.
 * All attributes are optional. This is an advanced example.
 */
module.exports = async (context) =>
  await {
    out: `${context.workspaceFolder}/${context.templateName}`, // Output folder for generated template files.

    componentName: 'App Component',
    camelCaseComponentName: context._toCamelCase('appComponent'),

    /**
     * Runs before generating all template files.
     * Returns a modified context to proceed, `false` to skip, or nothing to continue unchanged.
     */
    beforeAll: (context) => {
      context.showInformationMessage("Executing 'beforeAll' hook.");
      // As an alternative to include/exclude logic, you can update the `templateFiles` paths list here.
      return {
        templateFiles: context.templateFiles // Sort, filter, or update the `templateFiles` list as needed.
      };
    },
    /**
     * Runs before generating each template file.
     * Returns a modified context to proceed, `false` to skip, or nothing to continue unchanged.
     */
    beforeEach: (context) => {
      context.showInformationMessage("Executing 'beforeEach' hook.");
      return {
        outputFile: context.outputFile, // Specify a custom output file path here if needed.
        camelCaseComponentName: context._toCamelCase(context.componentName) // Convert the component name to camel case.
      };
    },
    /**
     * Processes data before interpolation for each file.
     * `data` is always a string. Returns updated `data` as a string and/or modified context to proceed, `false` to skip, or nothing to continue unchanged.
     */
    processBeforeEach: ({ data: _data, context }) => {
      context.showInformationMessage("Processing data in 'processBeforeEach' hook.");
    },
    /**
     * Processes data after interpolation for each file.
     * `data` is always a string. Returns updated `data` as a string and/or modified context to proceed, `false` to skip, or nothing to continue unchanged.
     */
    processAfterEach: ({ data, context }) => {
      context.showInformationMessage("Processing data in 'processAfterEach' hook.");

      const updatedData = data.replace(/__componentName__/g, context._toPascalCase(context.componentName));

      // Return the updated data or context to proceed.
      return { data: updatedData, context };
    },
    /**
     * Runs after generating each template file.
     * Returns a modified context to proceed, `false` to skip, or nothing to continue unchanged.
     */
    afterEach: (context) => {
      context.showInformationMessage("Executing 'afterEach' hook.");
    },
    /**
     * Runs after generating all template files.
     * Returns a modified context to proceed, `false` to skip, or nothing to continue unchanged.
     */
    afterAll: (context) => {
      context.showInformationMessage("Executing 'afterAll' hook.");
    }
  };
