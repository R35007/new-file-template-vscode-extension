# New File Template

Create new files or folders from a custom template.

<a href="https://buymeacoffee.com/r35007" target="_blank">
  <img src="https://r35007.github.io/Siva_Profile/images//buymeacoffee.png" />
</a>

## Features

- Create custom template files and folders effortlessly.
- Provide multiple custom template folders and config paths.
- Prompt user input on demand or on load.
  - Example: `${input.componentName}` prompts the user for the `componentName`.
- Configure user input prompts based on conditions.
- Simplify logic within templates using JavaScript expressions.
  - Example: `${new Date()}`, `${process.env.HOME}`, or `${Math.random()}`.
- Set predefined variables and user input values for seamless template generation.
- Configure user input as plain text, single select, or multiple choice, with validation and transformation capabilities.
- Utilize hook functions for enhanced control:
  - **beforeAll(context)**: Executes before generating all template files. Return `false` to skip the template or return a new `context` to modify the existing context.
  - **beforeEach(context)**: Executes before generating each template file. Return `false` to skip the template file or return a new `context` to modify the existing context.
  - **processBeforeEach({ data, context })**: Executes before interpolating template data for each file. Return `false` to skip the template file or return new `data` and `context` to modify the existing data and context.
  - **processAfterEach({ data, context })**: Executes after interpolating template data for each file. Return `false` to skip the template file or return new `data` and `context` to modify the existing data and context.
  - **afterEach(context)**: Executes after generating each template file. Return `false` to skip the template file or return a new `context` to modify the existing context.
  - **afterAll(context)**: Executes after generating all template files. Return `false` to skip the template file or return a new `context` to modify the existing context.
- Add cursors at specific positions by generating the template as a snippet.
- Dynamically include and exclude template files based on user inputs.
- Utilize helper case conversion methods:
  - Example 1: `${input.componentName_toPascalCase}` prompts input and converts it to PascalCase.
  - Example 2: `${_toPascalCase(componentName)}` converts an existing variable value to PascalCase.
- Generate multiple templates simultaneously.
- Configure settings to open specific template files after generation.

### Preview

> This demonstration uses sample React component templates. However, this extension is not limited to React; it is a versatile tool that can create any template to meet various business needs.

#### Create New Template
![Image](https://github.com/user-attachments/assets/c3210761-583e-407b-92df-414f16fd5dba)

#### Create New File From Template
![Image](https://github.com/user-attachments/assets/2b4c1411-1ae9-4e4d-8864-1300913fded5)

### Usage

- Create a folder inside `./vscode/Templates`, for example: `./vscode/Templates/MyTemplate` (the folder name will be the template name).
- Create a new file, folder, or subfolder inside the `./vscode/Templates/MyTemplate` folder, for example: `./vscode/Templates/MyTemplate/${input.componentName}/${input.fileName}.ts`.
- Right-click on any file or folder where you want to generate the file from the template and select `New File From Template`.
- You will be prompted to pick a template name and provide the necessary variables such as `${input.componentName}` and `${input.fileName}`.
- Once all inputs are provided, a new file will be generated from the selected template.

### Simple File
  - Example: `./vscode/Templates/MyTemplate/package.json`
  - This will prompt inputs with the pattern `${input.<variable name without spaces>}`
  ```jsonc
  {
      "displayName": "${input.extensionName}", // this will prompt extensionName from the user
      "name": "${extensionName_toKebabCase}", //  this will convert the extensionName to kebab case
      "description": "${input.description_toSentenceCase}", // this prompts the description and then converts into a sentence case
      "version": "${input.version}",
      "publisher": "Thinker",
      "license": "MIT",
      "author": {
          "name": "r35007",
          "email": "sendmsg2siva@gmail.com"
      },
      "repository": {
          "type": "git",
          "url": "https://github.com/R35007/${_toKebabCase(extensionName)}" // can use helper methods to convert any variable values
      }
  }
  ```

### Template File

Any file under the templates folder that ends with `.template.js` is considered a template module file. It is expected to return a module function from this template file, which will be called with a `context` object. While generating this file as an output file, the `.template.js` suffix will be removed from the file name. This helps in writing dynamic script logic to generate a template file. Please make sure to return a template string to generate the template data.

- Example 1: `./vscode/Templates/MyTemplate/${input.componentName}.tsx.template.js`
  - File names ending with `*.template.js` should always expose a method and will be called with a `context` object as an argument.
  ```js 
  module.exports = async ({ componentName, _toCamelCase }) => `import styled from 'styled-components';
  export interface ${componentName}Props {};

  export const ${componentName} = (${_toCamelCase(componentName)}Props: ${componentName}Props) => { 
    // your component logic goes here 👇
    return <Styled${componentName} {...${_toCamelCase(componentName)}Props} />
  };
  `;
  ```

- Example 2: `./vscode/Templates/MyTemplate/${input.componentName}.tsx.template.js`
  - This example demonstrates escaping backticks (`) in the template.
  ```js
  module.exports = async ({ componentName, _toCamelCase }) => `import styled from 'styled-components';
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

- Example 3: `./vscode/Templates/MyTemplate/${input.componentName}.tsx.template.js`
  - This example demonstrates prompting inputs on demand for each template.
  ```js
  module.exports = async ({ componentName, _toCamelCase, promptInput }) => {
    const name = await promptInput('name', { title: 'What is your name?' }); // make sure to await the response

    return `import styled from 'styled-components';
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
            Hi ${name}!
          </Styled${componentName}>
        )
      };
      `;
  };
  ```

- Example 4: `./vscode/Templates/MyTemplate/${Date.now()}.log.md`
  - This example demonstrates adding multi-cursor positions with `$<number>`.
  - Make sure to enable the snippet generation settings `(new-file-template.settings.enableSnippetGeneration)` to do this. 
  ```md
    # Daily Log

    - Author: $1
    - Email: $2
    - Version: $3
    - Date: ${new Date().toString()}

    ---

    Activities:
    - $4
  ```

### Case Conversions

View more available case conversions [here](https://github.com/R35007/new-file-template-vscode-extension/blob/pre-release/v1/Templates/extension-predefined-variables.md#case-converters).

### Template Configuration

By default, the extension searches for `_config.json`, `_config.js`, or `_config/index.js` within the template folder. You can also specify a custom configuration file path using the `new-file-template.settings.configPath` extension setting.

```ts
export type UserConfig = {
  beforeAll?: (context: Context) => Context | false | void; // Executes before generating all template files.
  beforeEach?: (context: Context) => Context | false | void; // Executes before generating each template file.
  processBeforeEach?: ({ data, context }: { data: string; context: Context }) => { data: string; context: Context } | false | void; // Executes before interpolating template data for each file.
  processAfterEach?: ({ data, context }: { data: string; context: Context }) => { data: string; context: Context } | false | void; // Executes after interpolating template data for each file.
  afterEach?: (context: Context) => Context | false | void; // Executes after generating each template file.
  afterAll?: (context: Context) => Context | false | void; // Executes after generating all template files.
  out: string; // Output directory for generated files.
  inputValues: Record<string, unknown>; // Predefined input values for template generation.
  variables: Record<string, unknown>; // Additional variables for template generation.
  input: Record<string, InputConfig | ((context: Context) => InputConfig | unknown) | unknown>; // Configuration for user input prompts.
  overwriteExistingFile?: 'prompt' | 'never' | 'always'; // Behavior for overwriting existing files.
  promptTemplateFiles?: boolean; // Whether to prompt for template files.
  interpolateTemplateContent?: boolean; // Whether to interpolate template content.
  enableSnippetGeneration?: boolean; // Whether to enable snippet generation.
  openAfterGeneration?: boolean | string[] | ((context: Context) => string[]); // Files to open after generation.
  include: string[] | ((context: Context) => string[]); // Files to include in the template.
  exclude: string[] | ((context: Context) => string[]); // Files to exclude from the template.
};

export interface InputConfig {
  prePrompt?: boolean | ((context: Context) => boolean); // Whether to prompt before generating the template.
  value?: any; // Default value for the input.
  title?: string; // Title for the input prompt.
  placeHolder?: string; // Placeholder text for the input prompt.
  options?: string[] | QuickPickItem[]; // Options for single select or multiple choice inputs.
  validateInput?: string | ((value: unknown, context: Context) => string | undefined); // Validation function for the input.
  transform?: string | ((value: unknown, context: Context) => unknown); // Transformation function for the input.
  canPickMany?: boolean; // Whether multiple options can be selected.
  matchOnDescription?: boolean; // Whether to match on description in the input prompt.
  matchOnDetail?: boolean; // Whether to match on detail in the input prompt.
  ignoreFocusOut?: boolean; // Whether to ignore focus out in the input prompt.
  password?: boolean; // Whether the input is a password.
}
```

### Extension Configuration Settings

The extension can be configured using the following settings in your `settings.json` file:

- `new-file-template.settings.out`: Output directory for generated files. Default is the workspace root.
- `new-file-template.settings.inputValues`: Predefined input values for template generation. Default is an empty object.
- `new-file-template.settings.variables`: Additional variables for template generation. Default is an empty object.
- `new-file-template.settings.input`: Configuration for user input prompts. Default is an empty object.
- `new-file-template.settings.overwriteExistingFile`: Configure behavior for overwriting existing files. Options are `prompt`, `never`, and `always`. Default is `prompt`.
- `new-file-template.settings.promptTemplateFiles`: Enable or disable prompting for template files. Default is `true`.
- `new-file-template.settings.interpolateTemplateContent`: Enable or disable interpolation of template content. Default is `true`.
- `new-file-template.settings.enableSnippetGeneration`: Enable or disable snippet generation. Default is `false`.
- `new-file-template.settings.openAfterGeneration`: Configure which files to open after generation. Can be a boolean, an array of file paths, or a function returning an array of file paths. Default is `false`.
- `new-file-template.settings.include`: Files to include in the template. Can be an array of file paths or a function returning an array of file paths.
- `new-file-template.settings.exclude`: Files to exclude from the template. Can be an array of file paths or a function returning an array of file paths.

> **Note:** These extension settings will always be overwritten by the template configurations defined in the template files.

Example configuration in `settings.json`:
```json
{
  "new-file-template.settings.out": "",
  "new-file-template.settings.inputValues": {},
  "new-file-template.settings.variables": {},
  "new-file-template.settings.input": {},
  "new-file-template.settings.overwriteExistingFile": "prompt",
  "new-file-template.settings.promptTemplateFiles": true,
  "new-file-template.settings.interpolateTemplateContent": true,
  "new-file-template.settings.enableSnippetGeneration": false,
  "new-file-template.settings.openAfterGeneration": false,
  "new-file-template.settings.include": [],
  "new-file-template.settings.exclude": []
}
```

