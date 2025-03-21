module.exports = async ({ componentName, camelCaseComponentName }) => `import styled from 'styled-components';
export interface ${componentName}Props {};

export const ${componentName} = (${camelCaseComponentName}Props: ${componentName}Props) => { 
  // your component logic goes here 👇
  return <div {...${camelCaseComponentName}Props} />
};
`;
