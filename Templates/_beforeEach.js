module.exports = (config) => {
  /* Write your operation here 👇 that runs before generating each template file */
  return { ...config, ...config.variables, ...config.inputValues };
};
