module.exports = {
  /**
   * Runs before generating all template files.
   * @param {Object} context - The context object.
   * @returns {Object|undefined|void|false} - The function can return different types based on the context:
   * - {Object}: Returns a new context object to proceed with the next iteration.
   * - {false}: Returns false to skip the current iteration.
   * - {undefined|void}: Returns undefined or void to proceed without changing the context.
   */
  beforeAll: (context) => context,
  /**
   * Runs before generating all template files.
   * @param {Object} context - The context object.
   * @returns {Object|undefined|void|false} - The function can return different types based on the context:
   * - {Object}: Returns a new context object to proceed with the next iteration.
   * - {false}: Returns false to skip the current iteration.
   * - {undefined|void}: Returns undefined or void to proceed without changing the context.
   */
  beforeEach: (context) => ({ ...context, camelCaseComponentName: context._toCamelCase(context.componentName) }),
  /**
   * Runs before interpolating template data for each file.
   * @param {Object} params - The parameters object.
   * @param {string} params.data - The data string.
   * @param {Object} params.context - The context object.
   * @returns {Object|undefined|void|false} - The function can return different types based on the context:
   * - {Object}: Returns a new data string and context object to proceed with the next iteration.
   * - {false}: Returns false to skip the current iteration.
   * - {undefined|void}: Returns undefined or void to proceed without changing the context or data string
   */
  processBeforeEach: ({ data, context }) => ({ data, context }), // return new data string or new context;
  /**
   * Runs after interpolating template data for each file.
   * @param {Object} params - The parameters object.
   * @param {string} params.data - The data string.
   * @param {Object} params.context - The context object.
   * @returns {Object|undefined|void|false} - The function can return different types based on the context:
   * - {Object}: Returns a new data string and context object to proceed with the next iteration.
   * - {false}: Returns false to skip the current iteration.
   * - {undefined|void}: Returns undefined or void to proceed without changing the context or data string.
   */
  processAfterEach: ({ data, context }) => {
    const updateData = data.replace(/__componentName__/g, context._toPascalCase(context.componentName));
    return { data: updateData, context }; // return new data string or new context;
  },
  /**
   * Runs after generating each template file.
   * @param {Object} context - The context object.
   * @returns {Object|undefined|void|false} - The function can return different types based on the context:
   * - {Object}: Returns a new context object to proceed with the next iteration.
   * - {false}: Returns false to skip the current iteration.
   * - {undefined|void}: Returns undefined or void to proceed without changing the context.
   */
  afterEach: (context) => context,
  /**
   * Runs after generating all template files.
   * @param {Object} context - The context object.
   * @returns {Object|undefined|void|false} - The function can return different types based on the context:
   * - {Object}: Returns a new context object to proceed with the next iteration.
   * - {false}: Returns false to skip the current iteration.
   * - {undefined|void}: Returns undefined or void to proceed without changing the context.
   */
  afterAll: (context) => context
};
