# New File Template

Create new file or folders from a custom Template.

## Preview

## Create New File From Template

![New_File_From_Template](https://github.com/R35007/new-file-template-vscode-extension/assets/23217228/1d29563b-d64f-4367-b90a-b0ae295546a4)

### Create New Sample Template

![New_Sample_Template](https://github.com/R35007/new-file-template-vscode-extension/assets/23217228/4a8e60c2-e21e-4be4-9118-f9afb3f51967)

## Simple Demo of Angular Component Template files generation

![Angular_Component_From_Templates](https://github.com/R35007/new-file-template-vscode-extension/assets/23217228/94869500-bcad-4514-813c-d6d3186ed1f7)

# Usage

- Create a folder inside `./vscode/Templates`. Ex: `./vscode/Templates/MyTemplate`
- Create a new file or folder inside the `./vscode/Templates/MyTemplate` folder. Ex: `./vscode/Templates/MyTemplate/${input.componentName}/${input.fileName}.ts`
- Now right click any file folder where you want generate the file from template and click `New File From Template`
- This will prompt you to pick a template name and needed variables like `${input.componentName}`, `${input.fileName}`
- Once all the inputs are given, this will generate you a new file from the selected template.

## Helper String Methods

| **Method**                                 | **Example Input** | **Example Output** |
| ------------------------------------------ | ----------------- | ------------------ |
| \_.toAlphaNumericCase ( value?: string )   | "foo-123-bar"     | "foo123bar"        |
| \_.toSnakeCase ( value?: string )          | "foo bar"         | "foo_bar"          |
| \_.toCamelCase ( value?: string )          | "foo bar"         | "fooBar"           |
| \_.toPascalCase ( value?: string )         | "foo-bar"         | "FooBar"           |
| \_.toKebabCase ( value?: string )          | "foo bar"         | "foo-bar"          |
| \_.toTitleCase ( value?: string )          | "foo bar"         | "Foo Bar"          |
| \_.toSentenceCase ( value?: string )       | "foo bar"         | "Foo bar"          |
| \_.toUppercase ( value?: string )          | "foo bar"         | "FOO BAR"          |
| \_.toLowercase ( value?: string )          | "Foo Bar"         | "foo bar"          |
| \_.toCapitalizedWords ( value?: string )   | "foo bar"         | "Foo Bar"          |
| \_.toStudlyCaps ( value?: string )         | "foo bar"         | "FoO BaR"          |
| \_.toTrainCase ( value?: string )          | "foo bar"         | "Foo-bar"          |
| \_.toScreamingSnakeCase ( value?: string ) | "foo bar"         | "FOO_BAR"          |
| \_.toScreamingKebabCase ( value?: string ) | "foo bar"         | "FOO-BAR"          |
| \_.toDotCase ( value?: string )            | "foo bar"         | "foo.bar"          |
| \_.toSuperTitleCase ( value?: string )     | "foo-bar"         | "Foo Bar"          |

## Predefined Variables

```js
/**
 * @userHome ${userHome} -> process.env.HOME
 * @workspaceFolder ${workspaceFolder} -> Active vscode workspace folder
 * @cwd ${cwd} -> alias ${workspaceFolder}
 * @workspaceFolderBasename ${workspaceFolderBasename}
 * @file ${file}
 * @relativeFile ${relativeFile}
 * @relativeFileDirname ${relativeFileDirname}
 * @fileBasename ${fileBasename}
 * @fileBasenameNoExtension ${fileBasenameNoExtension}
 * @fileDirName ${fileDirName}
 * @fileExtname ${fileExtname}
 * @outputDir ${outputDir}
 * @outputDirBasename ${outputDirBasename}
 * @relativeOutputDir ${relativeOutputDir}
 * @outputFile ${outputFile}
 * @relativeOutputFile ${relativeOutputFile}
 * @outputFileBasename ${outputFileBasename}
 * @outputFileBasenameNoExtension ${outputFileBasenameNoExtension}
 * @outputFileExtname ${outputFileExtname}
 * */
```

### Dynamic Variables

```js
/**
 * @input ${input.componentName} -> This prompts the user for 'componentName'.
 * @input ${input.componentName} -> This will not prompt the user for 'componentName' again as it was already prompted from the previous line and has the value.
 * @input ${componentName} -> Once we got the values from the user the input variables can also be access directly anywhere in the template code.
 * @inputCase ${componentName_toPascalCase} ${componentName_toCamelCase} -> All user Input will be pre cased and can be accessed by ${<input variable>_<case helper method>}
 * @package ${package.version} -> Access package.json object here. This will be available only if the package.json is at the root of the workspace folder.
 * @env ${env.USERNAME} -> All process.env variables can be accessed here
 * @variables ${variables.lorem} -> Access custom variables
 * @date ${Date.now()}
 * @dateFormatted ${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}
 * */
```

### Template Configuration

- Each Template folder can have an optional file called `_config.json`.
- Using this file we cam allocate a predefined variables, input description and options for a specific templates.

Example: Here is the example config file `_config.json`

```jsonc
{
  "input": {
    // Add prefilled value for the inputs
    // By adding this value here, on generating a file from Template it will not prompt the user for ${input.fileName}
    // Example: If we add "componentName":"ButtonComponent" -> Then on generating a files from template will not prompt "componentName" to the user and use this as a default value
    "fileName": "index"
  },
  "package": {
    // If the property is not available or the package.json is not present at the root
    // This will act as a fallback value for the package.json.
    "version": "1.0.0"
  },
  "env": {
    // Add any custom process.env variables specific to a Template
    // This will act as a fallback value for the process.env
    "NODE_ENV": "development"
  },
  "variables": {
    // Add any custom variables specific to a Template
    // These variable can be access thru ${variables.foobar}, ${variables.lorem} ...
    "foobar": "foo bar",
    "lorem": "Lorem ipsum dolor sit amet consectetur adipisicing elit."
  },
  "inputDetails": {
    // This object helps to define the user inputs
    "ext": {
      // ${input.ext} will access this config
      "description": "Please select the file Extension", // description of the input
      "options": [".js", ".jsx", ".ts", ".tsx", ".json", ".java", ".txt", ".md"] // If options are given then it will prompt a quick pick
    },
    "componentName": {
      // ${input.componentName} will access this config
      // Set a default value for the componentName variable
      // Note: setting default value to a input is different form giving a value in _config.json -> input.componentName.
      // Giving a value in _config.json -> input.componentName will not prompt the user input
      // Adding a default value here will still prompt the user input with prefilled value.
      "default": "MyComponent",
      "description": "Please provide a componentName in pascal case",
      "convert": "toPascalCase" // Provide the converted method name to convert your value by default
    }
  }
}
```
