/**
 * This configuration file demonstrates all available features.
 * Every attribute in this configuration is optional. The configuration below is an advanced example for demonstration purposes.
 */
const hooks = require('./_hooks');

module.exports = (_context) => ({
  ...hooks,
  out: '${workspaceFolder}/ReactComponent',
  inputValues: {
    // User input values will be added here. If a value is present here, it will not prompt the user.
    // This will replace the values from variables and input configurations.
    fileName: 'Index'
  },
  variables: {
    fileName: 'test', // This value will be ignored since it is used in inputValues.
    componentName: 'AppComponent', // Set default input value for componentName.
    foobar: '$fooBar jazQux$',
    lorem: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    user: { name: 'r35007' }
  },
  // Input configurations. Inputs will always be prompted on demand if the file or folder contains ${input.<user variable>} and the value is not present.
  input: {
    tags: {
      title: 'Filter',
      placeHolder: 'Please pick a file type to filter',
      promptAlways: true, // If true, it always prompts the user input even if the file or folder doesn't contain the text ${input.<user variable>}.
      canPickMany: true, // If true, it prompts multiple choices.
      matchOnDescription: false,
      matchOnDetail: false,
      ignoreFocusOut: true, // Set to false to close the input dialog on focus out.
      options: [
        { label: 'React', description: 'React', detail: 'This generates React component files', value: 'react', picked: true },
        { label: 'Story', description: 'Story', detail: 'This generates Storybook files', value: 'story', picked: true },
        { label: 'Test', description: 'Test', detail: 'This generates test case files', value: 'test', picked: true }
      ]
      /* Select input won't have validator, validateInput, password */
    },
    componentName: {
      when: ({ tags }) => tags?.includes('react'), // Prompts only when tags include 'react'.
      value: 'AppComponent',
      promptAlways: false,
      password: false,
      ignoreFocusOut: true,
      placeHolder: 'Please provide a componentName in PascalCase',
      validator: "${value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'}", // Use this if using _config.json.
      validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'), // validateInput always takes precedence.
      afterInput: '${_toPascalCase(value)}', // Use this if using _config.json.
      transform: (value, context) => context._toPascalCase(value) // transform always takes precedence.
      /* Text input won't have matchOnDescription, matchOnDetail, canPickMany */
    }
  },
  promptTemplateFiles: true, // If false, it will never prompt the user to select individual template files.
  include: [], // include additional files
  // Files or folders to exclude from template generation.
  // You can also directly provide an array of string values.
  // exclude: ['./_hooks.js']
  exclude: ({ tags }) => {
    const files = ['./_hooks.js'];
    const templates = {
      react: ['./${componentName}.tsx.template.js', './${camelCaseFileName}.ts.template.js'],
      test: ['./${componentName}.test.tsx.template.js'],
      story: ['./${componentName}.stories.tsx.template.js']
    };

    Object.keys(templates).forEach((key) => {
      if (!tags.includes(key)) files.push(...templates[key]);
    });

    return files;
  }
});
