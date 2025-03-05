module.exports = (context) => {
  /* Write your operation here 👇 that runs before generating each template file */
  // return the new context or return false to skip current template
  return { ...context, camelCaseFileName: context._toPascalCase(context.fileName) };
};
