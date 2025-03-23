// Escape all backticks (`) and dollar ($) symbols inside the template
module.exports = async ({ componentName, camelCaseComponentName, commentDescription }) => `import styled from 'styled-components';
export interface ${componentName}Props {};

const Styled${componentName} = styled.div\`
  \${({ width }) => \`
    width: \${width}
  \`}
\`;

export const ${componentName} = (${camelCaseComponentName}Props: ${componentName}Props) => { 
  // ${commentDescription} 👇
  return <Styled${componentName} {...${camelCaseComponentName}Props} />
};
`;
