/**
 * This configuration file demonstrates all available features.
 * Every attribute in this configuration is optional. The configuration below is an advanced example for demonstration purposes.
 */
const hooks = require('./_hooks');

module.exports = (_context) => ({
  ...hooks,
  out: '${workspaceFolder}/ReactComponent',
  inputValues: {
    // User input values will be added here. If a value is present here, the user will not be prompted.
    // This will override the values from variables and input configurations.
    fileName: 'Index'
  },
  variables: {
    fileName: 'test', // This value will be ignored since it is used in inputValues.
    componentName: 'AppComponent', // Sets the default input value for componentName.
    foobar: '@foo1Bar2 3jaz4Qux$',
    lorem: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    user: { name: 'r35007' }
  },
  // Input configurations. Inputs will always be prompted on demand if the file or folder contains ${input.<user variable>} and the value is not present.
  input: {
    tags: {
      title: 'Filter',
      placeHolder: 'Please pick a file type to filter',
      prePrompt: true, // If true, it prompts on load if the value is not present.
      canPickMany: true, // If true, it allows multiple choices.
      matchOnDescription: false,
      matchOnDetail: false,
      ignoreFocusOut: true, // Set to false to close the input dialog on focus out.
      options: [
        { label: 'React', description: 'React', detail: 'Generates React component files', value: 'react', picked: true },
        { label: 'Story', description: 'Story', detail: 'Generates Storybook files', value: 'story', picked: true },
        { label: 'Test', description: 'Test', detail: 'Generates test case files', value: 'test', picked: true }
      ]
      /* Select input won't have validateInput, password */
    },
    componentName: {
      prePrompt: ({ tags }) => tags?.includes('react'), // Prompts only when tags include 'react'.
      value: 'AppComponent',
      password: false,
      ignoreFocusOut: true,
      placeHolder: 'Please provide a component name in PascalCase',
      // validateInput: "${value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'}", // Use this if using _config.json.
      validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'), // validateInput always takes precedence.
      // transform: '${_toPascalCase(value)}', // Use this if using _config.json.
      transform: (value, context) => context._toPascalCase(value) // transform always takes precedence.
      /* Text input won't have matchOnDescription, matchOnDetail, canPickMany */
    },
    description: ({ tags }) => ({
      title: 'Storybook Description',
      value: 'This is a sample storybook description',
      prePrompt: tags?.includes('story') // Prompts only when tags include 'story'.
    })
  },
  overwriteExistingFile: 'prompt', // Set to 'prompt' | 'never' | 'always'.
  promptTemplateFiles: true, // If false, it will never prompt the user to select individual template files.
  interpolateTemplateContent: false, // If true, it searches for the pattern ${input.<variable>} in *.template.js files, returns the data string, and prompts the user for input.
  enableSnippetGeneration: false, // It true, it enable snippet generation for template files. Snippets help with cursor placement using placeholders like $<number>.
  // Can also be set to true or false, or (context) => []. If matches or true, opens all generated files. This will always be true if `enableSnippetGeneration` is not set to true.
  openAfterGeneration: ['extension-predefined-variables.md'],

  // include: [] // Can also provide a list of path values.
  include: ({ allTemplateFiles }) => allTemplateFiles, // Includes additional files.

  // exclude: ['./_hooks.js'] // Can also provide a list of path values.
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
