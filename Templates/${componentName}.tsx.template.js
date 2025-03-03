module.exports = ({ componentName, _toPascalCase, _toCamelCase }) => `export interface ${_toPascalCase(componentName)}Props {}

export const ${_toPascalCase(componentName)} = (${_toCamelCase(componentName)}Props: ${_toPascalCase(componentName)}Props) => { 
        // your component logic goes here 👇
}
`;
