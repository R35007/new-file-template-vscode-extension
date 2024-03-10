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
| **\_toAlphaCase**        | Foo--123-Bar-@-Qux-Baz   | Foo Bar Qux Baz         |
| **\_toNumericCase**      | Foo--123-Bar-@-Qux-Baz   | 123                     |
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
- **`${fileDirname}`** - /home/your-username/your-project/folder
- **`${fileExtname}`** - .ext
- **`${outputDir}`** - /home/your-username/your-project/output-folder
- **`${outputDirBasename}`** - output-folder
- **`${relativeOutputDir}`** - /your-project/output-folder
- **`${outputFile}`** - /home/your-username/your-project/output-folder/output-file.ext
- **`${relativeOutputFile}`** - /your-project/output-folder/output-file.ext
- **`${outputFileBasename}`** - output-file.ext
- **`${outputFileBasenameNoExtension}`** - output-file
- **`${outputFileExtname}`** - .ext

### Dynamic Input

- **`${input.componentName}`** -> This prompts the user for `componentName` if the value of the componentName is not present.
- **`${input.lorem}`** -> This will not prompt the user as the value was predefined in the `_config.json` -> input.lorem.
- **`${componentName}`**, **`${foobar}`** -> any input variables can also be directly accessed.
- **`${componentName_toPascalCase}`** **`${componentName_toCamelCase}`** -> any input variables can be converted to the given case.

### Package JSON

Access `package.json` located at the root of the workspace folder.

- **`${package.version || 'v1.0.0'}`**

### Node global variables

- **`${process.env.USERNAME}`**
- **`${process.env.NODE_ENV || 'development'}`**
- **`${Date.now()}`**
- **`${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`**
- **`${Math.random()}`**
- **`${__dirname}`**
- **`${__filename}`**

### Template Configuration

- Each Template folder can have an optional file called `_config.json`.
- Using this file we cam allocate a predefined variables, input description and options for a specific templates.

Example: Here is the example config file `_config.json`

```jsonc
{
  // These input variables can be accessed as ${input.componentName} or ${componentName}
  "input": {
    "foobar": "foo bar", // predefined value for ${input.foobar} or ${foobar}. This will not prompt the user input
    "lorem": "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    "fileName": "index",
    "ext": {
      "title": "Extension", // Title of the Quick Pick. If not provided it shows the variable name in Title case. Ex: Ext
      "placeHolder": "Please select the file Extension", // description of the input
      // If options are given then it will prompt a quick pick
      "options": [
        { "label": ".tsx", "description": "Typescript React", "value": ".tsx", "picked": true },
        { "label": ".ts", "description": "Typescript", "value": ".ts" },
        { "label": ".jsx", "description": "Javascript React", "value": ".jsx" },
        { "label": ".js", "description": "Javascript", "value": ".js" }
      ] // or "options": [".js", ".jsx", ".ts", ".tsx"]
    },
    "componentName": {
      "value": "AppComponent", // Set a pre filled value for the componentName variable prompt
      "promptAlways": false, // Set to true to always prompts the user input even if file or folder  doesn't contains the text ${input.<user variable>}
      "placeHolder": "Please provide a componentName in pascal case",
      // custom validator. return a error string if validation fails else return an empty string to proceed
      "validator": "${value?.trim().length >= 5 ? '' : 'Please Enter a minimum 5 characters'}", // will be validated on change
      // This will be invoked after the user enters the input. Here we can add prefix or suffix or return any default value
      // In this example I have just converted the value into _toPascalCase
      "afterInput": "${value?.trim().length ? _toPascalCase(value) : ''}" // or "afterInput": "prefix-${value}-suffix"
    }
  }
}
```
