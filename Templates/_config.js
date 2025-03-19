/**
 * Configuration file demonstrating available features.
 * All attributes are optional. This is an advanced example.
 */
const hooks = require('./_hooks');

module.exports = (context) => ({
  ...hooks,
  out: `${context.workspaceFolder}/${context.templateName}`, // Output folder for generated template files.
  inputValues: {
    // Predefined user input values. These override variables and input configurations.
    fileName: 'index'
  },
  variables: {
    fileName: 'test', // Ignored because it is overridden in inputValues.
    componentName: 'AppComponent', // Default value for componentName.
    foobar: '1@foo1Bar2 3jaz4Qux$',
    lorem: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    user: { name: 'r35007' }
  },
  input: {
    tags: {
      title: 'Filter',
      placeHolder: 'Select a file type to filter',
      prePrompt: true, // Prompts on load if the value is not set.
      canPickMany: true, // Allows multiple selections.
      matchOnDescription: false,
      matchOnDetail: false,
      ignoreFocusOut: true, // Keeps the input dialog open on focus out.
      options: [
        { label: 'React', description: 'React', detail: 'Generates React component files', value: 'react', picked: true },
        { label: 'Story', description: 'Story', detail: 'Generates Storybook files', value: 'story', picked: true },
        { label: 'Test', description: 'Test', detail: 'Generates test case files', value: 'test', picked: true }
      ]
    },
    description: ({ tags }) => ({
      title: 'Storybook Description',
      value: 'Sample storybook description',
      prePrompt: tags?.includes('story') // Prompts on load only if 'story' is selected.
    }),
    componentName: {
      value: 'AppComponent',
      password: false,
      ignoreFocusOut: true,
      placeHolder: 'Enter a component name in PascalCase',
      validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Enter at least 5 characters'), // Validates input length.
      transform: (value, context) => context._toPascalCase(value) // Transforms input to PascalCase.
    }
  },
  // overwriteExistingFile: 'prompt', // Options: 'prompt' | 'never' | 'always'.
  // promptTemplateFiles: false, // If false, skips prompting for individual template files.
  // enableSnippetGeneration: false, // Enables snippet generation for template files.
  // openAfterGeneration: true,  // Opens generated files if true or matches a condition.
  // interpolateByLine: false,  // Interpolates each line individually. On error, returns the original line.
  // disableInterpolation: false,  // Disables JavaScript expression interpolation for replacements.
  // promptVariablePatterns: ['\\$\\{input\\.([^\\}]+)\\}'] // Prompts user input for matched pattern variables.
  // include: [] // List of files or conditions to include.
  // exclude: ['./_hooks.js'] // List of files or conditions to exclude.

  // Filters template files based on user input.
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
  // times: 3 // Number of iterations or a callback returning contexts or iterations.
  // times: (context) => [
  //   { fileName: new Date().getTime() },
  //   { fileName: new Date().getTime() }
  // ]
});
