module.exports = (context) => ({
  out: `${context.workspaceFolder}/${context.templateName}`, // Specifies the output directory for the generated template files.
  // times: 3 // Alternatively, you can specify the number of times the template should be generated.
  // times: async () => 3 // You can also provide a callback that returns the number of times to generate the template.
  // times: [] // Alternatively, provide a list of new contexts.

  // In this example, we provide a callback that returns a list of callbacks, each generating a new context.
  times: async (context) => {
    // Generates the template 5 times, with a unique context for each iteration.
    // The new contexts automatically merge with the existing context, so manual spreading of the current context is unnecessary.
    const newContexts = [
      {
        times: 1,
        newDate: new Date().getTime(), // Records the current timestamp.
        author: 'R35007',
        title: 'Moments That Mattered',
        email: 'sendmsg2siva@gmail.com',
        templateName: context.templateName
      },
      // An asynchronous callback can also be provided for an iteration.
      async (context) => ({
        times: 2,
        newDate: new Date().getTime(), // Records the current timestamp.
        author: 'R35007',
        title: 'Chronicles of Today',
        email: 'sendmsg2siva@gmail.com',
        templateName: context.templateName
      }),
      () => ({
        times: 3,
        newDate: new Date().getTime(), // Records the current timestamp.
        author: 'R35007',
        title: 'Reflections & Insights',
        email: 'sendmsg2siva@gmail.com',
        templateName: context.templateName
      }),
      () => ({
        times: 4,
        newDate: new Date().getTime(), // Records the current timestamp.
        author: 'R35007',
        title: 'Unfolding Chapters',
        email: 'sendmsg2siva@gmail.com',
        templateName: context.templateName
      }),
      () => ({
        times: 5,
        newDate: new Date().getTime(), // Records the current timestamp.
        author: 'R35007',
        title: 'From Sunrise to Sunset',
        email: 'sendmsg2siva@gmail.com',
        templateName: context.templateName
      })
    ];

    return newContexts;
  }
});
