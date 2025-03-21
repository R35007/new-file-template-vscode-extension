module.exports = (context) => ({
  out: `${context.workspaceFolder}/${context.templateName}`, // Output folder for generated template files.
  variables: {
    componentName: 'AppComponent' // Default value for componentName.
  },
  input: {
    componentName: {
      title: 'Component Name',
      value: 'AppComponent',
      placeHolder: 'Enter a component name in PascalCase',
      validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Enter at least 5 characters'), // Validates input length.
      transform: (value, context) => context._toPascalCase(value) // Transforms input to PascalCase.
    }
  },
  beforeEach: ({ componentName, _toCamelCase }) => ({ camelCaseComponentName: _toCamelCase(componentName) })
});
