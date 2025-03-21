// Escape all backticks (`) and dollar ($) symbols inside the template
module.exports = async ({ componentName, camelCaseComponentName }) => `import styled from 'styled-components';
export interface ${componentName}Props {};

const Styled${componentName} = styled.div\`
  \${({ width }) => \`
    width: \${width}
  \`}
\`;

export const ${componentName} = (${camelCaseComponentName}Props: ${componentName}Props) => { 
  // your component logic goes here 👇
  return <Styled${componentName} {...${camelCaseComponentName}Props} />
};
`;
