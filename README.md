# New File Template

Create new file or folders from a custom Template.

### Preview

![New_Templates_Demo-1709932609860](https://github.com/R35007/new-file-template-vscode-extension/assets/23217228/3a5beb54-bf48-404c-ad68-b3c88bec77eb)

### Usage

- Create a folder inside `./vscode/Templates`. Ex: `./vscode/Templates/MyTemplate`
- Create a new file or folder inside the `./vscode/Templates/MyTemplate` folder. Ex: `./vscode/Templates/MyTemplate/${input.componentName}/${input.fileName}.ts`
- Now right click any file folder where you want generate the file from template and click `New File From Template`
- This will prompt you to pick a template name and needed variables like `${input.componentName}`, `${input.fileName}`
- Once all the inputs are given, this will generate you a new file from the selected template.

### Helper String Methods

Use helper case methods to convert any variable to the defined case. Ex: **`${_toPascalCase(componentName)}`**

| Function                 | Example Input            | Output                  |
| ------------------------ | ------------------------ | ----------------------- |
| **\_toAlphaNumericCase** | Foo--123-Bar-@-Qux-Baz   | Foo 123 Bar Qux Baz     |
| **\_toSpaceCase**        | fooBarQuxBaz             | Foo Bar Qux Baz         |
| **\_toTitleCase**        | FooBar-Qux\_\_Baz-fooBar | Foo Bar Qux Baz Foo Bar |
| **\_toCamelCase**        | FooBar-Qux\_\_Baz        | fooBarQuxBaz            |
| **\_toPascalCase**       | FooBar-Qux\_\_Baz-fooBar | FooBarQuxBazFooBar      |
| **\_toSnakeCase**        | FooBar-Qux\_\_Baz-fooBar | foo_bar_qux_baz_foo_bar |
| **\_toSnakeUpperCase**   | FooBar-Qux\_\_Baz-fooBar | FOO_BAR_QUX_BAZ_FOO_BAR |
| **\_toSnakeTitleCase**   | FooBar-Qux\_\_Baz-fooBar | Foo_Bar_Qux_Baz_Foo_Bar |
| **\_toKebabCase**        | FooBar-Qux\_\_Baz-fooBar | foo-bar-qux-baz-foo-bar |
| **\_toKebabUpperCase**   | FooBar-Qux\_\_Baz-fooBar | FOO-BAR-QUX-BAZ-FOO-BAR |
| **\_toKebabTitleCase**   | FooBar-Qux\_\_Baz-fooBar | Foo_Bar_Qux_Baz_Foo_Bar |
| **\_toDotCase**          | FooBar-Qux\_\_Baz-fooBar | foo.bar.qux.baz.foo.bar |
| **\_toDotUpperCase**     | FooBar-Qux\_\_Baz-fooBar | FOO.BAR.QUX.BAZ.FOO.BAR |
| **\_toDotTitleCase**     | FooBar-Qux\_\_Baz-fooBar | Foo.Bar.Qux.Baz.Foo.Bar |
| **\_toSentenceCase**     | foo bar-qux Baz foobar   | Foo bar-qux Baz foobar  |
| **\_toCapitalizedWords** | foo bar-qux baz foobar   | Foo Bar-qux Baz Foobar  |
| **\_toStudlyCaps**       | foo bar-qux Baz foobar   | FoO BaR-QuX BaZ FoObAr  |
| **\_toUpperCase**        | fooBar                   | FOOBAR                  |
| **\_toLowerCase**        | FOOBAR                   | fooBar                  |

### Predefined Variables

- **`${userHome}`** - process.env.HOME - /home/your-username
- **`${workspaceFolder}`** - Active vscode workspace folder - /home/your-username/your-project
- **`*${cwd}*`** - alias **`${workspaceFolder}`** - /home/your-username/your-project
- **`${workspaceFolderBasename}`** - your-project
- **`${file}`** - /home/your-username/your-project/folder/file.ext
- **`${relativeFile}`** - folder/file.ext
- **`${relativeFileDirname}`** - folder
- **`${fileBasename}`** - file.ext
- **`${fileBasenameNoExtension}`** - file
- **`${fileDirName}`** - /home/your-username/your-project/folder
- **`${fileExtname}`** - .ext
- **`${outputDir}`** - /home/your-username/your-project/selected-folder
- **`${outputDirBasename}`** - selected-folder
- **`${relativeOutputDir}`** - /your-project/selected-folder
- **`${outputFile}`** - /home/your-username/your-project/selected-folder/selected-file.ext
- **`${relativeOutputFile}`** - /your-project/selected-folder/selected-file.ext
- **`${outputFileBasename}`** - selected-file.ext
- **`${outputFileBasenameNoExtension}`** - selected-file
- **`${outputFileExtname}`** - .ext

### Dynamic Variables

- **`${input.componentName}`** - This prompts the user for 'componentName'.
- **`${input.componentName}`** - This will not prompt the user for 'componentName' again as it was already prompted from the previous line and has the value.
- **`${componentName}`** - Once we got the values from the user the input variables can also be access directly anywhere in the template code.
- **`${componentName_toCamelCase}`** **`${componentName_toPascalCase}`** - All user Input will be pre cased and can be accessed by `${<input variable>_<case helper method>}`
- **`${package.version}`** - Access package.json object here. This will be available only if the package.json is at the root of the workspace folder.
- **`${env.USERNAME}`** - All process.env variables can be accessed here
- **`${variables.lorem}`** - Access custom variables
- **`${Date.now()}`** - Get current date
- **`${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`** - get formatted date

### Template Configuration

- Each Template folder can have an optional file called `_config.json`.
- Using this file we cam allocate a predefined variables, input description and options for a specific templates.

Example: Here is the example config file `_config.json`

```jsonc
{
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
  // This object helps to define the user inputs
  "input": {
    // Add default value for the input fileName
    // By directly setting a string here, on generating a file from Template it will not prompt the user for ${input.fileName}
    // Example: If we add "componentName":"ButtonComponent" -> Then on generating a files from template will not prompt "componentName" to the user and use this as a default value
    // Adding a direct value here will also generate all predefined cases. Example: ${fileName_toPascalCase}, ${fileName_toCamelCase} etc...
    "fileName": "index",
    "ext": {
      // ${input.ext} will access this config
      "title": "Extension", // Title of the Quick Pick. If not provided it shows the variable name in Title case. Ex: Ext
      "placeHolder": "Please select the file Extension", // description of the input
      // If options are given then it will prompt a quick pick
      // "options": [".js", ".jsx", ".ts", ".tsx", ".json", ".java", ".txt", ".md"]
      // or
      "options": [
        { "label": ".tsx", "description": "Typescript React", "value": ".tsx", "picked": true },
        { "label": ".ts", "description": "Typescript", "value": ".ts" },
        { "label": ".jsx", "description": "Javascript React", "value": ".jsx" },
        { "label": ".js", "description": "Javascript", "value": ".js" },
        { "label": ".json", "description": "Json", "value": ".json" },
        { "label": ".java", "description": "Java", "value": ".java" },
        { "label": ".txt", "description": "Text", "value": ".txt" },
        { "label": ".md", "description": "Markdown", "value": ".md" }
      ]
    },
    "componentName": {
      // ${input.componentName} will access this config
      // Set a pre filled value for the componentName variable prompt
      "value": "AppComponent",
      // By default all inputs will prompted to the user on demand when the selected file or folder contains a text ${input.<user variable>}. Ex: ${input.componentName}
      // If this prop is set to true then it will always prompts the user input even if file or folder  doesn't contains the text ${input.<user variable>}
      // By setting this true we can directly access variable as ${componentName_toPascalCase} instead of ${_toPascalCase(`${input.componentName}`)},
      "promptAlways": false,
      "placeHolder": "Please provide a componentName in pascal case",
      // custom validator. return a error string if validation fails else return an empty string to proceed
      // will be validated on change
      "validator": "${value?.trim().length >= 5 ? '' : 'Please Enter a minimum 5 characters'}",
      // This will be invoked after the user enters the input. Here we can add prefix or suffix or return any default value
      // In this example I have just converted the value into _toPascalCase
      "afterInput": "${value?.trim().length ? _toPascalCase(value) : ''}"
      // or
      // "afterInput": "prefix-${value}-suffix"
    }
  }
}
```
