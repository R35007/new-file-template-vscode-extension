module.exports = (context) => ({
  out: `${context.workspaceFolder}/${context.templateName}`, // Output folder for generated template files.
  disableInterpolation: true, // Disabling interpolation is not mandatory for simple find-and-replace operations. However, it is necessary when using custom `promptVariablePatterns` to identify and process variables within the template.
  promptVariablePatterns: ['__([A-Za-z0-9]+)__'],
  variables: {
    componentName: 'App Component' // Default value for componentName.
  },
  input: {
    componentName: {
      title: 'Component Name',
      value: 'AppComponent', // Prefilled value.
      placeHolder: 'Enter a component name in PascalCase.',
      validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Enter at least 5 characters.'), // Validates input length.
      transform: (value, context) => context._toPascalCase(value) // Transforms input to PascalCase.
    }
  },
  /* Since interpolation is disabled, we can use either processBothEach or processAfterEach hooks to find and replace text. */
  processAfterEach: ({ data, context }) => {
    let updateData = Object.entries(context.inputValues).reduce(
      (result, [key, value]) => result.replace(new RegExp(`__${key}__`, 'g'), value),
      data
    );
    updateData = updateData.replace(/\$camelCaseComponentName\$/g, context._toCamelCase(context.inputValues.componentName));

    // Set custom output file
    const updatedContext = { outputFile: context.outputFile.replace(/__componentName__/g, context.componentName) };

    return { data: updateData, context: updatedContext };
  }
});
