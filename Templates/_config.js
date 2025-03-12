/**
 * This configuration file demonstrates all available features.
 * Every attribute in this configuration is optional. The configuration below is an advanced example for demonstration purposes.
 */
const hooks = require('./_hooks');

module.exports = (_context) => ({
  ...hooks,
  out: '${workspaceFolder}/${templateName}',
  inputValues: {
    // User input values will be added here. If a value is present here, the user will not be prompted again.
    // This will override the values from variables and input configurations.
    fileName: 'index'
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
      // options: ["react", "story", "test"] // can also provide list of string values
      options: [
        { label: 'React', description: 'React', detail: 'Generates React component files', value: 'react', picked: true },
        { label: 'Story', description: 'Story', detail: 'Generates Storybook files', value: 'story', picked: true },
        { label: 'Test', description: 'Test', detail: 'Generates test case files', value: 'test', picked: true }
      ]
      /* Select input won't have validateInput, password */
    },
    description: ({ tags }) => ({
      title: 'Storybook Description',
      value: 'This is a sample storybook description',
      prePrompt: tags?.includes('story') // Prompts on load only when tags include 'story'.
    }),
    componentName: {
      value: 'AppComponent',
      password: false,
      ignoreFocusOut: true,
      placeHolder: 'Please provide a component name in PascalCase',
      // validateInput: "${value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'}", // Use this if using _config.json.
      validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'), // validateInput always takes precedence.
      // transform: '${_toPascalCase(value)}', // Use this if using _config.json.
      transform: (value, context) => context._toPascalCase(value) // transform always takes precedence.
      /* Text input won't have matchOnDescription, matchOnDetail, canPickMany */
    }
  },
  // overwriteExistingFile: 'prompt', // Provide a string value or context callback. Set to 'prompt' | 'never' | 'always'.
  // promptTemplateFiles: false, // Provide a boolean value or context callback. If false, it will never prompt the user to select individual template files.
  // enableSnippetGeneration: false, // Provide a boolean value or context callback. If true, it enable snippet generation for template files. Snippets help with cursor placement using placeholders like $<number>.
  // openAfterGeneration: true,  // Provide a list of string or boolean value or context callback. If matches or true, opens all generated files. This will always be true if `enableSnippetGeneration` is not set to true.
  // promptVariablePatterns: ['\\$\\{input\\.([^\\}]+)\\}'] // Provide a list of string or context callback. Prompts the user input for matched pattern variables
  // include: [] // Provide a list of string or context callback.
  // exclude: ['./_hooks.js'] // Provide a list of string or context callback.

  // This example demonstrates filtering the template files based on user input selection
  exclude: ({ tags }) => {
    const files = ['./_hooks.js'];
    const templates = {
      react: ['./${input.componentName}.tsx.template.js', './${fileName}.ts.template.js'],
      test: ['./${input.componentName}.test.tsx.template.js'],
      story: ['./${input.componentName}.stories.tsx.template.js']
    };

    Object.keys(templates).forEach((key) => {
      if (!tags.includes(key)) files.push(...templates[key]);
    });

    return files;
  }
});
