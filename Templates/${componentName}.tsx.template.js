module.exports = ({ componentName, _toCamelCase }) => `export interface ${componentName}Props {}

export const ${componentName} = (${_toCamelCase(componentName)}Props: ${componentName}Props) => { 
  // your component logic goes here 👇
}
`;
