module.exports = {
  /**
   * Runs before generating all template files.
   * Return a modified context to proceed, `false` to skip, or nothing to continue unchanged.
   */
  beforeAll: (context) => context,
  /**
   * Runs before generating each template file.
   * Return a modified context to proceed, `false` to skip, or nothing to continue unchanged.
   */
  beforeEach: (context) => ({ ...context, camelCaseComponentName: context._toCamelCase(context.componentName) }),
  /**
   * Processes data before interpolation for each file.
   * `data` is always a string. Return updated `data` as a string and/or modified context to proceed, `false` to skip, or nothing to continue unchanged.
   */
  processBeforeEach: ({ data, context }) => ({ data, context }),
  /**
   * Processes data after interpolation for each file.
   * `data` is always a string. Return updated `data` as a string and/or modified context to proceed, `false` to skip, or nothing to continue unchanged.
   */
  processAfterEach: ({ data, context }) => {
    const updateData = data.replace(/__componentName__/g, context._toPascalCase(context.componentName));
    return { data: updateData, context };
  },
  /**
   * Runs after generating each template file.
   * Return a modified context to proceed, `false` to skip, or nothing to continue unchanged.
   */
  afterEach: (context) => context,
  /**
   * Runs after generating all template files.
   * Return a modified context to proceed, `false` to skip, or nothing to continue unchanged.
   */
  afterAll: (context) => context
};
