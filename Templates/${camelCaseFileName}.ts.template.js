module.exports = ({ componentName, _toPascalCase }) => `export * from './${_toPascalCase(componentName)}';`;
