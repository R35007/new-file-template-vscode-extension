# New File Template

Effortlessly create new files or folders from custom templates with this versatile tool. 🎉 It supports multiple template folders, user input prompts, JavaScript expressions, dynamic file inclusion/exclusion, and various case conversion methods to streamline your template generation process. 🚀

<a href="https://buymeacoffee.com/r35007" target="_blank">
  <img src="https://r35007.github.io/Siva_Profile/images//buymeacoffee.png" />
</a>

## Features

- Effortlessly create custom template files and folders. 📁
- Support for multiple custom template folders and config paths.
- Generate templates multiple times with the same or new contexts.
- Generate multiple output files from a single template file.
- Prompt user input on demand or on load. 📝
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
  - Example 2: `${_toPascalCase(componentName, { startWithAlpha: true })}` converts an existing variable value to PascalCase.
- Configure settings to open specific template files after generation.
- Configure custom patterns to identify variables and prompt users.
- Add logs for debugging. 🐛

### Preview

> This demonstration uses sample React component templates. However, this extension is not limited to React; it is a versatile tool that can create any template to meet various business needs.

![Demo](https://github.com/R35007/Assets/blob/main/New_File_Tempalte/demo_v4.0.0.gif?raw=true)

### Usage

- Create a folder inside `./vscode/Templates`, for example: `./vscode/Templates/MyTemplate` (the folder name will be the template name).
- Create a new file, folder, or subfolder inside the `./vscode/Templates/MyTemplate` folder, for example: `./vscode/Templates/MyTemplate/${input.componentName}/${input.fileName}.ts`.
- Right-click on any file or folder where you want to generate the file from the template and select `New File From Template`.
- You will be prompted to pick a template name and provide the necessary variables such as `${input.componentName}` and `${input.fileName}`.
- Once all inputs are provided, a new file will be generated from the selected template.

### Simple File

Interpolation occurs for the entire file content. If an error is encountered, the file content is returned without any interpolation.

To enable partial interpolation, set the `new-file-template.settings.interpolateByLine` setting to `true`. This will interpolate the content line by line.
If an error occurs, only the problematic line will be returned without interpolation, while the remaining lines will still be interpolated.

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

<details open>
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
  <summary>Example 4: Generate template multiple times</summary>
  
  - File: `./vscode/Templates/MyTemplate/_config.js`
  - This example demonstrates prompting inputs on demand for each template.
  - Note: times doesn't respect `new-file-template.settings.useSeparateInstance` settings. It always runs in a same instance.

```js
module.exports = async () => {
  // times: 4 // generates the templates 4 times with the same context
  // Generates the template 3 times with different component names
  times: async (context) => {
    const componentNames = ['AppComponent', 'TextComponent', 'MainComponent'];
    return componentNames.map((componentName) => ({ componentName }));
  };

  // Alternatively, return a list of callbacks that generate the template multiple times
  // This example returns 5 callbacks, each generating the template with a unique context
  // times: async (context) => {
  //   return Array(5)
  //     .fill('')
  //     .map(() => (context) => ({ ...context, fileName: new Date().getTime() }));
  // };
};
```

</details>

<details>
  <summary>Example 5: Generate multiple output files</summary>
  
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
        const newContext = {
          ...context,
          componentName,
          outputFile: context.outputFile // set custom output file path
          beforeEach: undefined // Make sure to set the current hook as undefined, else it will go into an infinite loop. In this case, it is `beforeEach`
        };
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
  <summary>Example 6: Generating Template as a Snippet for cursor placement</summary>

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
    "_toNumericCase": "1 1 2 3 4",
    "_toAlphaCase": "foo Bar jaz Qux",
    "_toAlphaNumericCase": "1 foo1Bar2 3jaz4Qux",
    "_toSpaceCase": "1 foo1 Bar2 3jaz4 Qux",
    "_toTitleCase": "1 Foo1 Bar2 3jaz4 Qux",
    "_toCamelCase": "1Foo1Bar23jaz4Qux",
    "_toPascalCase": "1Foo1Bar23jaz4Qux",
    "_toComponentNameCase": "Foo1Bar23jaz4Qux",
    "_toSnakeCase": "1_foo1_bar2_3jaz4_qux",
    "_toSnakeUpperCase": "1_FOO1_BAR2_3JAZ4_QUX",
    "_toConstantCase": "alias of _toSnakeUpperCase",
    "_toSnakeTitleCase": "1_Foo1_Bar2_3jaz4_Qux",
    "_toKebabCase": "1-foo1-bar2-3jaz4-qux",
    "_toKebabUpperCase": "1-FOO1-BAR2-3JAZ4-QUX",
    "_toKebabTitleCase": "1-Foo1-Bar2-3jaz4-Qux",
    "_toHeaderCase": "alias of _toKebabTitleCase",
    "_toTrainCase": "alias of _toKebabTitleCase",
    "_toDotCase": "1.foo1.bar2.3jaz4.qux",
    "_toDotUpperCase": "1.FOO1.BAR2.3JAZ4.QUX",
    "_toDotTitleCase": "1.Foo1.Bar2.3jaz4.Qux",
    "_toSentenceCase": "1 foo1Bar2 3jaz4Qux",
    "_toCapitalCase": "1 Foo1Bar2 3jaz4Qux",
    "_toStudlyCaps": "1 FoO1BaR2 3JaZ4QuX",
    "_toUpperCase": "1 FOO1BAR2 3JAZ4QUX",
    "_toLowerCase": "1 foo1bar2 3jaz4qux",
    "_toPathCase": "/foo1bar2/3jaz4qux"
  },
  "_split": "1,foo1Bar2,3jaz4Qux",
  "Custom PathCase": "foo/Bar/jaz/Qux"
}
```

### Template Configuration

By default, the extension searches for configuration files named `_config.json`, `_config.js`, or `_config/index.js` within the template folder. Alternatively, you can specify a custom configuration file path using the `new-file-template.settings.configPath` setting in the extension.

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
  times: number | ((context: Context) => number | Array<Context | ((context: Context) => Partial<Context>)>); // define number of times to generate template multiple times
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
export type Case = {
  _toNumericCase: (input?: string, options?: { preserve?: string }) => string;
  _toAlphaCase: (input?: string, options?: { preserve?: string }) => string;
  _toAlphaNumericCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _split: (input?: string, options?: { numeric?: boolean; alpha?: boolean; preserve?: string; startWithAlpha?: boolean }) => string[];
  _toSpaceCase: (input?: string, options?: { numeric?: boolean; alpha?: boolean; preserve?: string; startWithAlpha?: boolean }) => string;
  _toTitleCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toCamelCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toPascalCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toComponentNameCase: (input?: string) => string;
  _toSnakeCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toSnakeUpperCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toConstantCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toSnakeTitleCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toKebabCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toKebabUpperCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toKebabTitleCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toHeaderCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toTrainCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toDotCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toDotUpperCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toDotTitleCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toSentenceCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toCapitalizedWords: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toCapitalCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toStudlyCaps: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toUpperCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toLowerCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
  _toPathCase: (input?: string, options?: { preserve?: string; startWithAlpha?: boolean }) => string;
};

export type Utils = typeof Case & {
  log: (message: string, newLine?: string, noDate?: boolean) => void;
  clearLog: () => void;
  setContext: (context?: Context) => void;
  promptInput: (inputName: string, inputConfig: InputConfig) => unknown;
  readFile: (templateFile: string, context: Partial<Context>) => Promise<string>;
  getTemplateFileData: (templateFile: string, context?: Partial<Context>) => Promise<string | false>;
  createOutputFile: (data: string, contextOrOutputFile?: Partial<Context> | string) => Promise<void>;
  generateTemplateFile: (templateFile: string, contextOrOutputFile?: Partial<Context>) => Promise<void>;
  generateTemplateFiles: (templateFiles: string[], context?: Partial<Context>) => Promise<void>;
  generateTemplate: (template: string, context?: Partial<Context>) => Promise<void>;
  interpolate: (template: string, context: Context, hideError?: boolean, interpolateByLine?: boolean) => string;
  showInformationMessage: typeof window.showInformationMessage;
  showErrorMessage: typeof window.showErrorMessage;
  showWarningMessage: typeof window.showWarningMessage;
  Case: typeof Case;
  /*
    @example
    ```js
      const newFileTemplate = new FileTemplate(fsPath, allTemplates, selectedTemplates, newContext);
      newFileTemplate.log(messageString);
      newFileTemplate.clearLog();
      newFileTemplate.setContext(context);
      const input = await newFileTemplate.promptInput('inputName', inputConfig);
      const fileData = await newFileTemplate.readFile(templateFile, context);
      const templateFileData = await newFileTemplate.getTemplateFileData(templateFile, context);
      await newFileTemplate.createOutputFile(data, contextOrOutputFile);
      await newFileTemplate.generateTemplateFile(templateFile, contextOrOutputFile);
      await newFileTemplate.generateTemplateFiles(templateFiles, context);
      await newFileTemplate.generateTemplate(template, context);
      const interpolatedData = newFileTemplate.interpolate(template, context, hideError, interpolateByLine);
    ```
  */
  FileTemplate: typeof FileTemplate;
};
``;
````
