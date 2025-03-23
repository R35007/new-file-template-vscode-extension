module.exports = (context) => ({
  out: `${context.workspaceFolder}/${context.templateName}`, // Specifies the output directory for the generated template files.
  enableSnippetGeneration: true
});
