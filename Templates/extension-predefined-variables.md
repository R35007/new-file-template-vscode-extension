# Predefined Variables

## Dynamic Input

> Note: Input variable must not contain any spaces. Inputs are prompted on demand only when the input values are not present.
> Please make sure to escape all back ticks (\`)

- componentName -\`${input.componentName}\` -> This wont prompt again if the value is already prompted
- tags -\`${input.tags}\` -> This prompts the multiple choice. Need to configure options in the config file.
- inputVariables -\`${componentName}\`\`${tags}\`\`${foobar}\` -> any inputs and variables can be directly accessed.
- inputCaseConversion -\`${componentName_toPascalCase}\`\`${componentName_toCamelCase}\` -> any inputs and variables can be converted to the given case.

## User Input Values

- inputValues -\`${JSON.stringify(inputValues)}\`

## Variables

- variables -\`${JSON.stringify(variables)}\`

## Package JSON

- version -\`${package.version}\` -> Access package.json at the root of the workspace folder.

## Node Global Variables

- process execPath -\`${process.execPath}\`
- env NODE_ENV -\`${env.NODE_ENV || 'development'}\`
- date now -\`${Date.now()}\`
- formatted date -\`${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}\`
- random number -\`${Math.random()}\`
- __dirname -\`${__dirname}\`
- __filename -\`${__filename}\`

## User Directories

- userHome -\`${userHome}\`
- workspaceFolder -\`${workspaceFolder}\`
- cwd -\`${cwd}\`
- workspaceFolderBasename -\`${workspaceFolderBasename}\`
- workspaceFolderName -\`${workspaceFolderName}\`

## File System Paths

- fsPath -\`${fsPath}\` - fsPath is the selected explorer file or folder

### Folders (if fsPath is a folder)

- folder -\`${folder}\`
- relativeFolder -\`${relativeFolder}\`
- folderBasename -\`${folderBasename}\`
- folderName -\`${folderName}\`

### Files (if fsPath is a file)

- file -\`${file}\`
- fileWorkspaceFolder -\`${fileWorkspaceFolder}\`
- relativeFile -\`${relativeFile}\`
- relativeFileDirname -\`${relativeFileDirname}\`
- fileBasename -\`${fileBasename}\`
- fileName -\`${fileName}\`
- fileBasenameNoExtension -\`${fileBasenameNoExtension}\`
- fileNameNoExtension -\`${fileNameNoExtension}\`
- fileExtname -\`${fileExtname}\`
- fileDirname -\`${fileDirname}\`
- fileFolder -\`${fileFolder}\`
- fileDirBasename -\`${fileDirBasename}\`
- fileFolderName -\`${fileFolderName}\`

### Active Document (if any active document is opened)

- activeFile -\`${activeFile}\`
- activeFileWorkspaceFolder -\`${activeFileWorkspaceFolder}\`
- relativeActiveFile -\`${relativeActiveFile}\`
- relativeActiveFileDirname -\`${relativeActiveFileDirname}\`
- activeFileBasename -\`${activeFileBasename}\`
- activeFileName -\`${activeFileName}\`
- activeFileBasenameNoExtension -\`${activeFileBasenameNoExtension}\`
- activeFileNameNoExtension -\`${activeFileNameNoExtension}\`
- activeFileExtname -\`${activeFileExtname}\`
- activeFileDirname -\`${activeFileDirname}\`
- activeFileFolder -\`${activeFileFolder}\`
- activeFileDirBasename -\`${activeFileDirBasename}\`
- activeFileFolderName -\`${activeFileFolderName}\`

## Templates

- allTemplates - [\`${allTemplates?.join(', ')}\` ]
- templates - [\`${templates?.join(', ')}\` ]
- template -\`${template}\`
- relativeTemplate -\`${relativeTemplate}\`
- templateBasename -\`${templateBasename}\`
- templateName -\`${templateName}\`

### Template Files

- allTemplateFiles - [\`${allTemplateFiles?.join(', ')}\` ]
- templateFiles - [\`${templateFiles?.join(', ')}\` ]
- templateFile -\`${templateFile}\`
- relativeTemplateFile -\`${relativeTemplateFile}\`
- relativeTemplateFileToTemplate -\`${relativeTemplateFileToTemplate}\`
- relativeTemplateFileDirname -\`${relativeTemplateFileDirname}\`
- relativeTemplateFileToTemplateDirname -\`${relativeTemplateFileToTemplateDirname}\`
- templateFileBasename -\`${templateFileBasename}\`
- templateFileName -\`${templateFileName}\`
- templateFileBasenameNoExtension -\`${templateFileBasenameNoExtension}\`
- templateFileNameNoExtension -\`${templateFileNameNoExtension}\`
- templateFileExtname -\`${templateFileExtname}\`
- templateFileDirname -\`${templateFileDirname}\`
- templateFileDirBasename -\`${templateFileDirBasename}\`
- templateFileFolderName -\`${templateFileFolderName}\`

### Output Files

- outputFile -\`${outputFile}\`
- relativeOutputFile -\`${relativeOutputFile}\`
- relativeOutputFileDirname -\`${relativeOutputFileDirname}\`
- outputFileBasename -\`${outputFileBasename}\`
- outputFileName -\`${outputFileName}\`
- outputFileBasenameNoExtension -\`${outputFileBasenameNoExtension}\`
- outputFileNameNoExtension -\`${outputFileNameNoExtension}\`
- outputFileExtname -\`${outputFileExtname}\`
- outputFileDirname -\`${outputFileDirname}\`
- outputFileFolder -\`${outputFileFolder}\`
- outputFileDirBasename -\`${outputFileDirBasename}\`
- outputFileFolderName -\`${outputFileFolderName}\`

## Helper Methods

- example variables.foobar: \`\@foo1Bar2 3jaz4Qux\$\`

### Case Converters

- _toAlphaCase -\`${_toAlphaCase(variables.foobar)}\` or \`${foobar_toAlphaCase}\`
- _toNumericCase -\`${_toNumericCase(variables.foobar)}\` or \`${foobar_toNumericCase}\`
- _toAlphaNumericCase -\`${_toAlphaNumericCase(variables.foobar)}\` or \`${foobar_toAlphaNumericCase}\`
- _toSpaceCase -\`${_toSpaceCase(variables.foobar)}\` or \`${foobar_toSpaceCase}\`
- _toTitleCase -\`${_toTitleCase(variables.foobar)}\` or \`${foobar_toTitleCase}\`
- _toCamelCase -\`${_toCamelCase(variables.foobar)}\` or \`${foobar_toCamelCase}\`
- _toPascalCase -\`${_toPascalCase(variables.foobar)}\` or \`${foobar_toPascalCase}\`
- _toSnakeCase -\`${_toSnakeCase(variables.foobar)}\` or \`${foobar_toSnakeCase}\`
- _toSnakeUpperCase -\`${_toSnakeUpperCase(variables.foobar)}\` or \`${foobar_toSnakeUpperCase}\`
- _toSnakeTitleCase -\`${_toSnakeTitleCase(variables.foobar)}\` or \`${foobar_toSnakeTitleCase}\`
- _toKebabCase -\`${_toKebabCase(variables.foobar)}\` or \`${foobar_toKebabCase}\`
- _toKebabUpperCase -\`${_toKebabUpperCase(variables.foobar)}\` or \`${foobar_toKebabUpperCase}\`
- _toKebabTitleCase -\`${_toKebabTitleCase(variables.foobar)}\` or \`${foobar_toKebabTitleCase}\`
- _toDotCase -\`${_toDotCase(variables.foobar)}\` or \`${foobar_toDotCase}\`
- _toDotUpperCase -\`${_toDotUpperCase(variables.foobar)}\` or \`${foobar_toDotUpperCase}\`
- _toDotTitleCase -\`${_toDotTitleCase(variables.foobar)}\` or \`${foobar_toDotTitleCase}\`
- _toSentenceCase -\`${_toSentenceCase(variables.foobar)}\` or \`${foobar_toSentenceCase}\`
- _toCapitalizedWords -\`${_toCapitalizedWords(variables.foobar)}\` or \`${foobar_toCapitalizedWords}\`
- _toStudlyCaps -\`${_toStudlyCaps(variables.foobar)}\` or \`${foobar_toStudlyCaps}\`
- _toUpperCase -\`${_toUpperCase(variables.foobar)}\` or \`${foobar_toUpperCase}\`
- _toLowerCase -\`${_toLowerCase(variables.foobar)}\` or \`${foobar_toLowerCase}\`
