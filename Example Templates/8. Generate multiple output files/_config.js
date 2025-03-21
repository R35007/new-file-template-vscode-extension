module.exports = (context) => ({
  out: `${context.workspaceFolder}/${context.templateName}`, // Specifies the output directory for the generated template files.
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
  beforeEach: async (context) => {
    // Generates a custom template output file.
    if (context.templateFileName === 'Daily_Log_${new Date().getTime()}.md') {
      const newFileTemplate = context.FileTemplate.Create(); // Creates a new FileTemplate instance.
      const newContexts = [
        {
          times: 1,
          author: 'R35007',
          title: 'Moments That Mattered',
          email: 'sendmsg2siva@gmail.com',
          templateName: context.templateName
        },
        {
          times: 2,
          author: 'R35007',
          title: 'Chronicles of Today',
          email: 'sendmsg2siva@gmail.com',
          templateName: context.templateName
        },
        {
          times: 3,
          author: 'R35007',
          title: 'Reflections & Insights',
          email: 'sendmsg2siva@gmail.com',
          templateName: context.templateName
        },
        {
          times: 4,
          author: 'R35007',
          title: 'Unfolding Chapters',
          email: 'sendmsg2siva@gmail.com',
          templateName: context.templateName
        },
        {
          times: 5,
          author: 'R35007',
          title: 'From Sunrise to Sunset',
          email: 'sendmsg2siva@gmail.com',
          templateName: context.templateName
        }
      ];

      // Iterates through each context and generates the corresponding template file.
      for (let newContext of newContexts) {
        const updatedNewContext = {
          ...context, // Spreads the existing context to retain all properties.
          ...newContext,
          outputFile: context.outputFile, // Sets a custom output file path.
          beforeEach: undefined // Ensures the current hook (`beforeEach`) is set to undefined to prevent an infinite loop during execution.
        };

        await newFileTemplate.generateTemplateFile(context.templateFile, updatedNewContext);
        context.log(`${newFileTemplate.outputFile} generated successfully!`); // Logs the output file creation for debugging.
      }

      return false; // Skips the default Daily Log file generation since the files are manually created, allowing other template files to proceed.
    }

    // Returns a new context containing the transformed component name in camelCase.
    return { camelCaseComponentName: context._toCamelCase(context.componentName) };
  }
});
