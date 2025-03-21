/*
* Converts a string from one case style to another (e.g., underscore_case to PascalCase, camelCase, etc.).

* Methods to use:

* 1. componentName_toPascalCase
    @param {string} componentName - The variable in underscore_case.
    @returns {string} - The string in PascalCase.

* 2. _toPascalCase(componentName)
    @param {string} componentName - The variable in underscore_case.
    @returns {string} - The string in PascalCase.

* 3. Case._toPascalCase(componentName)
    @param {string} componentName - The variable in underscore_case.
    @returns {string} - The string in PascalCase.

 Note: Options 2 and 3 are equivalent. The methods inside the `Case` object
 can be accessed either directly or through the object.
 */
module.exports = async ({
  componentName,
  componentName_toPascalCase,
  _toCamelCase,
  Case
}) => `export interface ${componentName_toPascalCase}Props {};

export const ${componentName_toPascalCase} = (${Case._toCamelCase(componentName)}Props: ${componentName_toPascalCase}Props) => { 
  // your component logic goes here 👇
  return <div {...${_toCamelCase(componentName)}Props} />
};
`;
