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
  beforeEach: (context) => ({ ...context, camelCaseFileName: context._toPascalCase(context.fileName) }),
  /**
   * Runs before interpolating template data for each file.
   * @param {Object} params - The parameters object.
   * @param {Object} params.data - The data object.
   * @param {Object} params.context - The context object.
   * @returns {Object|undefined|void|false} - The function can return different types based on the context:
   * - {Object}: Returns a new data and context object to proceed with the next iteration.
   * - {false}: Returns false to skip the current iteration.
   * - {undefined|void}: Returns undefined or void to proceed without changing the context.
   */
  processBeforeEach: ({ data, context }) => ({ data, context }),
  /**
   * Runs after interpolating template data for each file.
   * @param {Object} params - The parameters object.
   * @param {Object} params.data - The data object.
   * @param {Object} params.context - The context object.
   * @returns {Object|undefined|void|false} - The function can return different types based on the context:
   * - {Object}: Returns a new data and context object to proceed with the next iteration.
   * - {false}: Returns false to skip the current iteration.
   * - {undefined|void}: Returns undefined or void to proceed without changing the context.
   */
  processAfterEach: ({ data, context }) => ({ data, context }),
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
