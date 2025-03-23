module.exports = async ({ componentName_toPascalCase, camelCaseComponentName }) => `export interface ${componentName_toPascalCase}Props {};

export const ${componentName_toPascalCase} = (${camelCaseComponentName}Props: ${componentName_toPascalCase}Props) => { 
  // your component logic goes here 👇
  return <div {...${camelCaseComponentName}Props} />
};
`;
