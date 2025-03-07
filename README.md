# New File Template

Create new files or folders from a custom template.

<a href="https://buymeacoffee.com/r35007" target="_blank">
  <img src="https://r35007.github.io/Siva_Profile/images//buymeacoffee.png" />
</a>

### Preview

> This demonstration uses sample React component templates. However, this extension is not limited to React; it is a versatile tool that can create any template to meet various business needs.

![Image](https://github.com/user-attachments/assets/7504f6e4-8960-4a67-9a06-ea9e15ba371d)

### Usage

- Create a folder inside `./vscode/Templates`, for example: `./vscode/Templates/MyTemplate`.
- Create a new file or folder inside the `./vscode/Templates/MyTemplate` folder, for example: `./vscode/Templates/MyTemplate/${input.componentName}/${input.fileName}.ts`.
- Right-click on any file or folder where you want to generate the file from the template and select `New File From Template`.
- You will be prompted to pick a template name and provide the necessary variables such as `${input.componentName}` and `${input.fileName}`.
- Once all inputs are provided, a new file will be generated from the selected template.

### Example Template Files
  - Example 1: `package.json`
  - This will prompt inputs with the pattern `${input.<variable name without spaces or special characters>}`
  ```jsonc
  {
      "name": "${input.extensionName_toKebabCase}",
      "displayName": "${input.extensionName_toTitleCase}",
      "description": "${input.description_toSentenceCase}",
      "version": "${input.version}",
      "publisher": "Thinker",
      "license": "MIT",
      "author": {
          "name": "r35007",
          "email": "sendmsg2siva@gmail.com"
      },
      "repository": {
          "type": "git",
          "url": "https://github.com/R35007/${extensionName_toKebabCase}"
      }
  }
  ```
  - Example 2: `${input.componentName}.template.js`
  - File names ending with `*.template.js` should always expose a method and will be called with a `context` object as an argument.
  ```js
  module.exports = async ({ componentName, _toCamelCase }) => `import styled from 'styled-component';
  export interface ${componentName}Props {};

  export const ${componentName} = (${_toCamelCase(componentName)}Props: ${componentName}Props) => { 
    // your component logic goes here 👇
    return <Styled${componentName} {...${_toCamelCase(componentName)}Props} />
  };
  `;
  ```
  - Example 3: `${input.componentName}.template.js`
  - This example demonstrates escaping backticks (`) in the template.
  ```js
  module.exports = async ({ componentName, _toCamelCase }) => `import styled from 'styled-component';
  export interface ${componentName}Props {};

  // Escape all backticks (\`) and dollar (\$) symbols inside the template 
  const Styled${componentName} = styled.div\`
    \${({ width }) => \`
      width: \${width}
    \`}
  \`;

  export const ${componentName} = (${_toCamelCase(componentName)}Props: ${componentName}Props) => { 
    // your component logic goes here 👇
    return <Styled${componentName} {...${_toCamelCase(componentName)}Props} />
  };
  `;
  ```
  - Example 4: `${input.componentName}.template.js`
  - This example demonstrates prompting inputs on demand for each template.
  ```js
  module.exports = async ({ componentName, _toCamelCase, promptInput }) => {
    const name = await promptInput('name', { title: 'What is your Name?' }); // make sure to await the response

    return `import styled from 'styled-component';
      export interface ${componentName}Props {};
    
      // Escape all backticks (\`) and dollar (\$) symbols inside the template 
      const Styled${componentName} = styled.div\`
        \${({ width }) => \`
          width: \\$\{width}
        \`}
      \`;
    
      export const ${componentName} = (${_toCamelCase(componentName)}Props: ${componentName}Props) => { 
        // your component logic goes here 👇
        return (
          <Styled${componentName} {...${_toCamelCase(componentName)}Props}>
            Hi ${name} !
          </Styled${componentName}>
        )
      };
      `;
  };
  ```
  - Example 5: `${Date.now()}.log.md`
  - This example demonstrates adding multi-cursor positions with `$<number>`.
  ```md
    # Daily Log

    - Author : $1
    - Email : $2
    - Version : $3
    - Date : ${new Date().toString()}

    ---

    Activities:
    - $4
  ```

### Case Conversions

View more available case conversions [here](https://github.com/R35007/new-file-template-vscode-extension/blob/pre-release/v1/Templates/extension-predefined-variables.md#case-converters).

### Template Configuration

The configuration file `_config.js` demonstrates all available features for template generation. Below is a detailed explanation of each configuration option:

#### Hooks
You can include custom hooks by requiring the `_hooks.js` file. These hooks allow you to execute custom logic at different stages of the template generation process.

```javascript
const hooks = require('./_hooks');
```

- **beforeAll(context)**: Runs before generating all template files.
- **beforeEach(context)**: Runs before generating each template file.
- **processBeforeEach({ data, context })**: Runs before interpolating template data for each file.
- **processAfterEach({ data, context })**: Runs after interpolating template data for each file.
- **afterEach(context)**: Runs after generating each template file.
- **afterAll(context)**: Runs after generating all template files.

#### Output Directory
Specify the output directory for the generated files:
```javascript
out: '${workspaceFolder}/ReactComponent',
```

#### Input Values
Predefine user input values to avoid prompting:
```javascript
inputValues: {
  fileName: 'Index'
},
```

#### Variables
Define variables to be used in your templates:
```javascript
variables: {
  fileName: 'test', // This value will be ignored since it is used in inputValues.
  componentName: 'AppComponent', // Set default input value for componentName.
  foobar: '$fooBar jazQux$',
  lorem: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  user: { name: 'r35007' }
},
```

#### Input Configurations
Configure inputs that will be prompted to the user:
```javascript
input: {
  tags: {
    prePrompt: true,
    title: 'Filter',
    placeHolder: 'Please pick a file type to filter',
    canPickMany: true,
    matchOnDescription: false,
    matchOnDetail: false,
    ignoreFocusOut: true,
    options: [
      { label: 'React', description: 'React', detail: 'This generates React component files', value: 'react', picked: true },
      { label: 'Story', description: 'Story', detail: 'This generates Storybook files', value: 'story', picked: true },
      { label: 'Test', description: 'Test', detail: 'This generates test case files', value: 'test', picked: true }
    ]
  },
  componentName: {
    prePrompt: ({ tags }) => tags?.includes('react'), // Prompts only when tags include 'react'.
    value: 'AppComponent',
    password: false,
    ignoreFocusOut: true,
    placeHolder: 'Please provide a componentName in PascalCase',
    // validateInput: "${value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'}",
    validateInput: (value) => (value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'),
    // transform: '${_toPascalCase(value)}',
    transform: (value, context) => context._toPascalCase(value)
  },
  description: (context)=> ({
    title: 'Storybook Description',
    prePrompt: tags?.includes('story') // Prompts only when tags include 'story'.
  })
},
```

#### Prompt Template Files
Control whether to prompt the user to select individual template files:
```javascript
promptTemplateFiles: true,
```

#### Include Additional Files
Specify additional files to include in the template generation:
```javascript
include: [],
```

#### Exclude Files or Folders
Exclude specific files or folders from template generation:
```javascript
exclude: ({ tags }) => {
  const files = ['./_hooks.js'];
  const templates = {
    react: ['./${componentName}.tsx.template.js', './${camelCaseFileName}.ts.template.js'],
    test: ['./${componentName}.test.tsx.template.js'],
    story: ['./${componentName}.stories.tsx.template.js']
  };

  Object.keys(templates).forEach((key) => {
    if (!tags.includes(key)) files.push(...templates[key]);
  });

  return files;
}
```

This configuration provides a comprehensive setup for generating files from templates, allowing for customization and flexibility based on user inputs and predefined settings.

