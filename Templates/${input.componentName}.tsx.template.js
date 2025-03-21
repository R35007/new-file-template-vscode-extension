// Escape all backTicks (`) and dollar ($) symbols inside the template
module.exports = async ({ componentName, camelCaseComponentName, _toCamelCase, promptInput }) => {
  const name = await promptInput('name', { title: 'What is your Name ?', value: 'R35007' }); // make sure await for the response

  return `import styled from 'styled-component';
export interface ${componentName}Props {};

const Styled${componentName} = styled.div\`
  \${({ width }) => \`
    width: \$\{width}
  \`}
\`;

export const ${componentName} = (${camelCaseComponentName}Props: ${componentName}Props) => { 
  // your component logic goes here 👇
  return (
    <Styled${componentName} {...${_toCamelCase(componentName)}Props}>
      Hi ${name} !
    </Styled${componentName}>
  )
};
`;
};
