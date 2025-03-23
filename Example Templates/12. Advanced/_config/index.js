/**
 * Configuration file demonstrating available features.
 * All attributes are optional. This is an advanced example.
 */
const hooks = require('./_hooks');

module.exports = (context) => ({
  ...hooks,
  out: `${context.workspaceFolder}/${context.templateName}`, // Output folder for generated template files.

  // Default values for directly accessing variables or input values
  tags: [],
  description: 'This is a sample story description',

  variables: {
    foobar: '1@foo1Bar2 3jaz4Qux$',
    lorem: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    repoUrl: 'https://github.com/R35007/new-file-template-vscode-extension',
    author: {
      name: 'R35007',
      email: 'sendmsg2siva@gmail.com'
    }
  },
  input: {
    // Set Predefined user input values.
    // All prompted input values goes here
    // If any value is already present here then it will not prompt the user input values
    fileName: 'index'
  },
  inputConfig: {
    componentName: {
      prePrompt: true,
      value: 'AppComponent',
      password: false,
      ignoreFocusOut: true,
      placeHolder: 'Enter a component name in PascalCase',
      validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Enter at least 5 characters'), // Validates input length.
      transform: (value, context) => context._toPascalCase(value) // Transforms input to PascalCase.
    },
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
    description: async ({ tags }) => ({
      title: 'Storybook Description',
      value: 'Sample storybook description',
      prePrompt: tags?.includes('story') // Prompts on load only if 'story' is selected inm tags.
    })
  },
  promptTemplateFiles: true, // Enables prompting to pick template files to generate.
  // overwriteExistingFile: 'always', // Options: 'prompt' | 'never' | 'always'. Defaults to 'prompt'
  // enableSnippetGeneration: true, // Enables snippet generation for template files.
  // openAfterGeneration: true,  // Opens generated files if true or matches a condition.
  // interpolateByLine: true,  // Interpolates each line individually. On error, returns the original line.
  // disableInterpolation: true,  // Disables JavaScript expression interpolation for replacements.
  // disableInterpolationErrorMessage: true,  // Disables interpolation error messages.
  // promptVariablePatterns: ['\\${input\\.([a-zA-Z0-9_]+)}', '__([A-Za-z0-9]+)__'] // Prompts user input for matched pattern variables.

  // Include template files based on user input.
  // include: ['./variables.jsonc'] // List of files or conditions to include.
  // include: async ({ tags }) => {
  //   const files = ['./variables.jsonc'];
  //   const templates = {
  //     react: ['./${input.componentName}.tsx.template.js', './${fileName}.ts.template.js'],
  //     test: ['./${input.componentName}.test.tsx.template.js'],
  //     story: ['./${input.componentName}.stories.tsx.template.js']
  //   };

  //   Object.keys(templates).forEach((key) => {
  //     if (tags.includes(key)) files.push(...templates[key]);
  //   });

  //   return files;
  // },

  // Exclude template files based on user input.
  // exclude: ['./_hooks.js'] // List of files or conditions to exclude.
  exclude: async ({ tags }) => {
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
  // In the example below, the same template is executed twice by assigning a different fileName in the context.
  // times: async (context) => [
  //   async (context) => ({ fileName: new Date().getTime() }),
  //   async (context) => ({ fileName: new Date().getTime() })
  // ]
});
