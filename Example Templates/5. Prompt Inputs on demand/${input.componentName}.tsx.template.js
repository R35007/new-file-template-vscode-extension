module.exports = async ({ componentName, camelCaseComponentName, promptInput }) => {
  const name = await promptInput('name', { title: 'What is your name?' }); // make sure to await the response

  return `import styled from 'styled-components';
export interface ${componentName}Props {};

// Escape all backticks (\`) and dollar (\$) symbols inside the template
const Styled${componentName} = styled.div\`
  \${({ width }) => \`
    width: \$\{width}
  \`}
\`;

export const ${componentName} = (${camelCaseComponentName}Props: ${componentName}Props) => {
  // your component logic goes here 👇
  return (
    <Styled${componentName} {...${camelCaseComponentName}Props}>
      Hi ${name}!
    </Styled${componentName}>
  )
};
`;
};
