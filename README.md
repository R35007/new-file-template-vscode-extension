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
- Configure user input prompts based on conditions. For more details, refer to the [template configuration section](#template-configuration).
- Simplify logic within templates using JavaScript expressions.
  - Example: `${new Date()}`, `${process.env.HOME}`, or `${Math.random()}`.
- Set predefined variables and user input values for seamless template generation.
- Configure user input as plain text, single select, or multiple choice, with validation and transformation capabilities.
- Utilize hook functions for enhanced control. For more details, refer to the [Hooks section](#hooks).
- Add cursors at specific positions by generating the template as a snippet.
- Dynamically include and exclude template files based on user inputs.
- Utilize helper case conversion methods:
  - Example 1: `${input.componentName_toPascalCase}` prompts input and converts it to PascalCase.
  - Example 2: `${_toPascalCase(componentName)}` converts an existing variable value to PascalCase.
- Generate multiple templates simultaneously.
- Configure settings to open specific template files after generation.
- Configure custom patterns to identify variables and prompt users.
- Add logs for debugging.
- Create multiple output file from a single template file.

### Preview

> This demonstration uses sample React component templates. However, this extension is not limited to React; it is a versatile tool that can create any template to meet various business needs.

![Demo](https://github.com/R35007/Assets/blob/main/New_File_Tempalte/demo.gif?raw=true)

### Usage

- Create a folder inside `./vscode/Templates`, for example: `./vscode/Templates/MyTemplate` (the folder name will be the template name).
- Create a new file, folder, or subfolder inside the `./vscode/Templates/MyTemplate` folder, for example: `./vscode/Templates/MyTemplate/${input.componentName}/${input.fileName}.ts`.
- Right-click on any file or folder where you want to generate the file from the template and select `New File From Template`.
- You will be prompted to pick a template name and provide the necessary variables such as `${input.componentName}` and `${input.fileName}`.
- Once all inputs are provided, a new file will be generated from the selected template.

### Simple File

Interpolation occurs for the entire file content. If an error is encountered, the file content is returned without any interpolation. 

To enable partial interpolation, set the `new-file-template.settings.interpolateByLine` setting to `true`. This will interpolate the content line by line. 
If an error occurs, only the problematic line will be returned without interpolation, while the remaining lines will still be interpolated.\

Set the `new-file-template.settings.disableInterpolationErrorMessage` setting to `true` to suppress error messages of interpolation.

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

Any file within the templates folder that ends with `.template.js` is considered a template module file. 
These files are expected to export a function that will be called with a `context` object. 

When generating the output file, the `.template.js` suffix will be removed from the file name. This allows for dynamic script logic to generate a template file. 
Ensure that the function returns a template string to generate the template data.

> Note: Template contents will not be interpolated for files ending with `*.template.js`.

<details>
  <summary>Example 1: Basic Usage</summary>
  
  - File: `./vscode/Templates/MyTemplate/${input.componentName}.tsx.template.js`
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

</details>

<details>
  <summary>Example 2: Escaping backticks (`) in the template.</summary>

- File: `./vscode/Templates/MyTemplate/${input.componentName}.tsx.template.js`

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

</details>

<details>
  <summary>Example 3: Prompt inputs on demand</summary>

- File: `./vscode/Templates/MyTemplate/${input.componentName}.tsx.template.js`
- This example demonstrates prompting inputs on demand for each template.

```js
module.exports = async ({ componentName, _toCamelCase, promptInput }) => {
  const name = await promptInput('name', { title: 'What is your name?' }); // make sure to await the response

  return `import styled from 'styled-components';
    export interface ${componentName}Props {};

    // Escape all backticks (\`) and dollar (\$) symbols inside the template
    const Styled${componentName} = styled.div\`
      \${({ width }) => \`
        width: \$\{width}
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

</details>

<details>
  <summary>Example 4: Generate multiple output file from a single Template file</summary>
  
  - File: `./vscode/Templates/MyTemplate/_hooks.js`
  - This example demonstrates prompting inputs on demand for each template.

```js
module.exports = async ({ componentName, templateFile, FileTemplate, log }) => {
  beforeEach: async (context) => {
    // Generate custom template output file
    if (context.templateFile === '${input.componentName}.tsx.template.js') {
      const newFileTemplate = FileTemplate.Create(); // Create a new instance
      const componentNames = ['AppComponent', 'TextComponent', 'MainComponent'];
      for (let componentName of componentNames) {
        // Make sure to set the current hook as undefined, else it will go into an infinite loop. In this case, it is `beforeEach`
        const newContext = { ...context, componentName, beforeEach: undefined };
        await newFileTemplate.generateTemplateFile(templateFile, newContext);
        log(`${newFileTemplate.outputFile} generated successfully!`); // Use log method for debugging
      }
      return false; // Return false to skip the current file
    }
  };
};
```

</details>

<details>
  <summary>Example 4: Generating Template as a Snippet for cursor placement</summary>

- File: `./vscode/Templates/MyTemplate/${Date.now()}.log.md`
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

</details>

### Case Conversions

```jsonc
{
  "exampleVariablesFoobar": "@foo1Bar2 3jaz4Qux$",
  "caseConverters": {
    "_toAlphaCase": "foo Bar jaz Qux",
    "_toNumericCase": "1 2 3 4",
    "_toAlphaNumericCase": "foo1Bar2 3jaz4Qux",
    "_toSpaceCase": "foo1 Bar2 3jaz4 Qux",
    "_toTitleCase": "Foo1 Bar2 3jaz4 Qux",
    "_toCamelCase": "foo1Bar23jaz4Qux",
    "_toPascalCase": "Foo1Bar23jaz4Qux",
    "_toSnakeCase": "foo1_bar2_3jaz4_qux",
    "_toSnakeUpperCase": "FOO1_BAR2_3JAZ4_QUX",
    "_toSnakeTitleCase": "Foo1_Bar2_3jaz4_Qux",
    "_toKebabCase": "foo1-bar2-3jaz4-qux",
    "_toKebabUpperCase": "FOO1-BAR2-3JAZ4-QUX",
    "_toKebabTitleCase": "Foo1-Bar2-3jaz4-Qux",
    "_toDotCase": "foo1.bar2.3jaz4.qux",
    "_toDotUpperCase": "FOO1.BAR2.3JAZ4.QUX",
    "_toDotTitleCase": "Foo1.Bar2.3jaz4.Qux",
    "_toSentenceCase": "Foo1Bar2 3jaz4Qux",
    "_toCapitalizedWords": "Foo1Bar2 3jaz4Qux",
    "_toStudlyCaps": "FoO1BaR2 3JaZ4QuX",
    "_toUpperCase": "FOO1BAR2 3JAZ4QUX",
    "_toLowerCase": "foo1bar2 3jaz4qux"
  }
}
```

### Template Configuration

By default, the extension searches for `_config.json`, `_config.js`, or `_config/index.js` within the template folder. You can also specify a custom configuration file path using the `new-file-template.settings.configPath` extension setting.

```ts
export type Hooks = {
  beforeAll?: (context: Context) => Context | false | void; // Executes before generating all template files.
  beforeEach?: (context: Context) => Context | false | void; // Executes before generating each template file.
  processBeforeEach?: ({ data, context }: { data: string; context: Context }) => { data: string; context: Context } | false | void; // Executes before interpolating template data for each file.
  processAfterEach?: ({ data, context }: { data: string; context: Context }) => { data: string; context: Context } | false | void; // Executes after interpolating template data for each file.
  afterEach?: (context: Context) => Context | false | void; // Executes after generating each template file.
  afterAll?: (context: Context) => Context | false | void; // Executes after generating all template files.
};

export type UserConfig = Hooks & {
  out: string; // Output directory for generated files.
  inputValues: Record<string, unknown>; // Predefined input values for template generation.
  variables: Record<string, unknown>; // Additional variables for template generation.
  input: Record<string, InputConfig | ((context: Context) => InputConfig | unknown) | unknown>; // Configuration for user input prompts.
  overwriteExistingFile?: 'prompt' | 'never' | 'always' | ((context: Context) => 'prompt' | 'never' | 'always'); // Behavior for overwriting existing files.
  promptTemplateFiles?: boolean | ((context: Context) => boolean); // Whether to prompt for template files.
  enableSnippetGeneration?: boolean | ((context: Context) => boolean); // Whether to enable snippet generation.
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

#### Hooks

Hooks are used to execute custom code before or after generating template files. They provide flexibility and control over the template generation process, allowing you to modify data or context as needed.

- **beforeAll(context)**: Executes before generating all template files. Return `false` to skip the template or return a new `context` to modify the existing context.
- **beforeEach(context)**: Executes before generating each template file. Return `false` to skip the template file or return a new `context` to modify the existing context.
- **processBeforeEach({ data, context })**: Executes before interpolating template data for each file. Return `false` to skip the template file or return new `data` and `context` to modify the existing data and context.
- **processAfterEach({ data, context })**: Executes after interpolating template data for each file. Return `false` to skip the template file or return new `data` and `context` to modify the existing data and context.
- **afterEach(context)**: Executes after generating each template file. Return `false` to skip the template file or return a new `context` to modify the existing context.
- **afterAll(context)**: Executes after generating all template files. Return `false` to skip the template file or return a new `context` to modify the existing context.

### Extension Configuration Settings

The extension can be configured using the following settings in your `settings.json` file:

- `new-file-template.settings.configPath`: Provide template config path. Set to empty to automatically pick `_config{.js|.json}` from the template folder.
- `new-file-template.settings.templatePaths`: Specify the paths to the custom templates folders.
- `new-file-template.settings.overwriteExistingFile`: Should overwrite existing file? (`prompt`, `never`, `always`).
- `new-file-template.settings.promptMultipleTemplates`: If true, prompts a multiple-choice picker to select multiple template folders to generate.
- `new-file-template.settings.useSeparateInstance`: If `new-file-template.settings.promptMultipleTemplates` is true, it uses the same instance to create multiple templates. Set to true to generate each template at a separate instance.
- `new-file-template.settings.promptTemplateFiles`: If true, prompts a multiple-choice picker to select the template files to generate.
- `new-file-template.settings.interpolateByLine`: If true, interpolates each line individually. On error, returns the original line without interpolation.
- `new-file-template.settings.disableInterpolationErrorMessage`: If true, It ignores interpolation error messages
- `new-file-template.settings.promptVariablePatterns`: Provide list of patterns to recognize and prmpt the user input variables. Defaults to `["\\$\\{input\\.([^\\}]+)\\}"]`
- `new-file-template.settings.enableSnippetGeneration`: If true, it enables snippet generation for template files. Snippets help with cursor placement using placeholders like `$<number>`.
- `new-file-template.settings.openAfterGeneration`: If true, opens all generated files. This will always be `true` if `new-file-template.settings.enableSnippetGeneration` is set to `true`.
- `new-file-template.settings.variables`: Define custom variables for template generation.
- `new-file-template.settings.input`: Define custom input variables. These variables can be accessed using `${input.<Your variable name>}` or `${<Your variable name>}`.

### Sample Settings

Add the following configuration to your `settings.json` file:

```json
{
  "new-file-template.settings.configPath": "",
  "new-file-template.settings.templatePaths": [ "./.vscode/templates" ],
  "new-file-template.settings.overwriteExistingFile": "prompt",
  "new-file-template.settings.promptMultipleTemplates": false,
  "new-file-template.settings.useSeparateInstance": false,
  "new-file-template.settings.promptTemplateFiles": false,
  "new-file-template.settings.interpolateByLine": false,
  "new-file-template.settings.disableInterpolationErrorMessage": false,
  "new-file-template.settings.promptVariablePatterns": ["\\$\\{input\\.([^\\}]+)\\}"],
  "new-file-template.settings.enableSnippetGeneration": false,
  "new-file-template.settings.openAfterGeneration": true,
  "new-file-template.settings.variables": {
    "foobar": "@foo1Bar2 3jaz4Qux$",
    "lorem": "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    "user": { "name": "r35007" }
  },
  "new-file-template.settings.input": {
    "fileName": "index",
    "ext": {[".tsx", ".ts", ".jsx", ".js", ".json", ".java", ".txt", ".md" ]},
    "componentName": {
      "prePrompt": true,
      "value": "AppComponent",
      "placeHolder": "Please provide a component name in PascalCase",
      "validateInput": "${value?.trim().length >= 5 ? '' : 'Please enter a minimum of 5 characters'}",
      "transform": "${value?.trim().length ? _toPascalCase(value) : ''}"
    }
  }
}
```

### Extension Context Utils

The `context` object contains many utility methods to create a template explicitly. These are the following methods:

````ts
export type Utils = typeof CaseConverts & {
  setContext: (context?: Context) => void;
  promptInput: (inputName: string, inputConfig: InputConfig, context?: Context) => void;
  getTemplateFileData: (templateFile: string, context?: Context) => Promise<unknown>;
  createOutputFile: (data: string, context: Context) => Promise<void>;
  generateTemplateFile: (templateFile: string, context?: Context) => Promise<void>;
  generateTemplateFiles: (templateFiles: string[], context?: Context) => Promise<void>;
  generateTemplate: (template: string, context?: Context) => Promise<void>;
  Case: {
    _toNumericCase: (input?: string) => string;
    _toAlphaCase: (input?: string) => string;
    _toAlphaNumericCase: (input?: string) => string;
    _toSpaceCase: (input?: string) => string;
    _toTitleCase: (input?: string) => string;
    _toCamelCase: (input?: string) => string;
    _toPascalCase: (input?: string) => string;
    _toSnakeCase: (input?: string) => string;
    _toSnakeUpperCase: (input?: string) => string;
    _toSnakeTitleCase: (input?: string) => string;
    _toKebabCase: (input?: string) => string;
    _toKebabUpperCase: (input?: string) => string;
    _toKebabTitleCase: (input?: string) => string;
    _toDotCase: (input?: string) => string;
    _toDotUpperCase: (input?: string) => string;
    _toDotTitleCase: (input?: string) => string;
    _toSentenceCase: (input?: string) => string;
    _toCapitalizedWords: (input?: string) => string;
    _toStudlyCaps: (input?: string) => string;
    _toUpperCase: (input?: string) => string;
    _toLowerCase: (input?: string) => string;
  };
  /* 
    @example
    ```js
      const newFileTemplate = new FileTemplate(fsPath, allTemplates, selectedTemplates, newContext);
      newFileTemplate.setContext(context);
      newFileTemplate.promptInput(inputName, inputConfig, context);
      newFileTemplate.getTemplateFileData(templateFile, context);
      newFileTemplate.createOutputFile(data, context);
      newFileTemplate.generateTemplateFile(templateFile, context);
      newFileTemplate.generateTemplateFiles(templateFiles, context);
      newFileTemplate.generateTemplate(template, context);
    ```
  */
  FileTemplate: typeof FileTemplate;
};
``;
````
