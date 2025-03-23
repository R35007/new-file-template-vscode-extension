module.exports = async ({ componentName, camelCaseComponentName, commentDescription }) => `import styled from 'styled-components';
export interface ${componentName}Props {};

export const ${componentName} = (${camelCaseComponentName}Props: ${componentName}Props) => { 
  // ${commentDescription} 👇
  return <div {...${camelCaseComponentName}Props} />
};
`;
