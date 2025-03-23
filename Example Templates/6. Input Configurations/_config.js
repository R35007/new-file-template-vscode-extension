module.exports = (context) => ({
  out: `${context.workspaceFolder}/${context.templateName}`, // Specifies the output folder for generated template files.

  // The 'description' will be overridden by input values or variables.description.
  // Input values have priority in overriding this value.
  // Example:
  // If context.description is 'Default description' and user input is 'User Description',
  // context.description will update to 'User Description,' while variables.description remains 'Default description'.
  description: 'Story description',
  tags: [],

  variables: {
    description: 'Default description', // Default story description.
    foobar: '1@foo1Bar2 3jaz4Qux$', // Sample data variable.
    lorem: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', // Placeholder text for demonstration.
    repoUrl: 'https://github.com/R35007/new-file-template-vscode-extension', // URL of the repository.
    author: {
      name: 'R35007', // Author name.
      email: 'sendmsg2siva@gmail.com' // Author email.
    }
  },

  input: {
    fileName: 'index' // Pre defined input values
  },

  inputConfig: {
    // Since prePrompt is not defined this will be prompted only on demand
    componentName: {
      title: 'Component Name', // Title for the component name input dialog.
      value: 'AppComponent', // Default component name.
      password: false, // Input visibility; false means text is visible.
      ignoreFocusOut: true, // Keeps the dialog open even if focus is lost.
      placeHolder: 'Enter a component name in PascalCase', // Placeholder for input guidance.
      validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Enter at least 5 characters'), // Ensures minimum length of 5 characters.
      transform: (value, context) => context._toPascalCase(value) // Converts input to PascalCase.
    },
    // SInce prePrompt is true this will be prompted on load even before the componentName
    tags: {
      prePrompt: true, // Shows prompt if the value is not set.
      title: 'Filter', // Title for the filter selection.
      placeHolder: 'Select a file type to filter', // Placeholder text for the dialog.
      canPickMany: true, // Allows multiple selections.
      matchOnDescription: false, // Filters by label only, not description.
      matchOnDetail: false, // Filters by label only, not details.
      ignoreFocusOut: true, // Keeps the dialog open even if focus is lost.
      // options: ['react', 'story', 'test'], // Alternatively we cal also provide a list of string values
      options: [
        { label: 'React', description: 'React', detail: 'Generates React component files', value: 'react', picked: true },
        { label: 'Story', description: 'Story', detail: 'Generates Storybook files', value: 'story', picked: true },
        { label: 'Test', description: 'Test', detail: 'Generates test case files', value: 'test', picked: true }
      ] // Options for tag filtering.
    },
    // Alternatively we can also provide a callback that returns the input config
    // This will be prompted on load only when the uer picks the 'story' in the tags prompt.
    description: ({ tags }) => ({
      title: 'Storybook Description', // Title for the story description dialog.
      value: 'Sample storybook description', // Default description value.
      prePrompt: tags.includes('story'), // Prompts only when 'story' is selected in tags.
      pattern: '^[A-Za-z\\s]+$' // pattern validation
    })
  }
});
