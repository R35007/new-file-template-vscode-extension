module.exports = async ({ componentName, camelCaseComponentName, commentDescription }) => `export interface ${componentName}Props {};

export const ${componentName} = (${camelCaseComponentName}Props: ${componentName}Props) => { 
  // ${commentDescription} 👇
  return <div {...${camelCaseComponentName}Props} />
};
`;
