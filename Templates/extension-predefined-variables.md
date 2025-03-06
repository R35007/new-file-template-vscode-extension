# Predefined Variables

## Dynamic Input

> Note: Input variable must not contain any spaces. Inputs are prompted on demand only when the input values are not present.

- componentName - ${input.componentName} -> This wont prompt again if the value is already prompted
- tags - ${input.tags} -> This prompts the multiple choice. Need to configure options in the config file.
- inputVariables - ${componentName} ${tags} ${foobar} -> any inputs and variables can be directly accessed.
- inputCaseConversion - ${componentName_toPascalCase} ${componentName_toCamelCase} -> any inputs and variables can be converted to the given case.

## User Input Values

- inputValues - ${JSON.stringify(inputValues)}

## Variables

- variables - ${JSON.stringify(variables)}

## Package JSON

- version - ${package.version} -> Access package.json at the root of the workspace folder.

## Node Global Variables

- process execPath - ${process.execPath}
- env NODE_ENV - ${env.NODE_ENV || 'development'}
- date now - ${Date.now()}
- formatted date - ${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}
- random number - ${Math.random()}
- **dirname - ${__dirname}
- **filename - ${__filename}

## User Directories

- userHome - ${userHome}
- workspaceFolder - ${workspaceFolder}
- cwd - ${cwd}
- workspaceFolderBasename - ${workspaceFolderBasename}
- workspaceFolderName - ${workspaceFolderName} = ${workspaceFolderName}

## File System Paths

- fsPath - ${fsPath} - fsPath is the selected explorer file or folder

### Folders (if fsPath is a folder)

- folder - ${folder}
- relativeFolder - ${relativeFolder}
- folderBasename - ${folderBasename}
- folderName - ${folderName}

### Files (if fsPath is a file)

- file - ${file}
- fileWorkspaceFolder - ${fileWorkspaceFolder}
- relativeFile - ${relativeFile}
- relativeFileDirname - ${relativeFileDirname}
- fileBasename - ${fileBasename} = ${fileName}
- fileName - ${fileName} = ${fileName}
- fileBasenameNoExtension - ${fileBasenameNoExtension}
- fileNameNoExtension - ${fileNameNoExtension}
- fileExtname - ${fileExtname}
- fileDirname - ${fileDirname}
- fileFolder - ${fileFolder}
- fileDirBasename - ${fileDirBasename}
- fileFolderName - ${fileFolderName}

### Active Document (if any active document is opened)

- activeFile - ${activeFile}
- activeFileWorkspaceFolder - ${activeFileWorkspaceFolder}
- relativeActiveFile - ${relativeActiveFile}
- relativeActiveFileDirname - ${relativeActiveFileDirname}
- activeFileBasename - ${activeFileBasename}
- activeFileName - ${activeFileName}
- activeFileBasenameNoExtension - ${activeFileBasenameNoExtension}
- activeFileNameNoExtension - ${activeFileNameNoExtension}
- activeFileExtname - ${activeFileExtname}
- activeFileDirname - ${activeFileDirname}
- activeFileFolder - ${activeFileFolder}
- activeFileDirBasename - ${activeFileDirBasename}
- activeFileFolderName - ${activeFileFolderName}

## Templates

- allTemplates - [ ${allTemplates?.join(', ')} ]
- templates - [ ${templates?.join(', ')} ]
- template - ${template}
- relativeTemplate - ${relativeTemplate}
- templateBasename - ${templateBasename}
- templateName - ${templateName}

### Template Files

- allTemplateFiles - [ ${allTemplateFiles?.join(', ')} ]
- templateFiles - [ ${templateFiles?.join(', ')} ]
- templateFile - ${templateFile}
- relativeTemplateFile - ${relativeTemplateFile}
- relativeTemplateFileDirname - ${relativeTemplateFileDirname}
- templateFileBasename - ${templateFileBasename}
- templateFileName - ${templateFileName}
- templateFileBasenameNoExtension - ${templateFileBasenameNoExtension}
- templateFileNameNoExtension - ${templateFileNameNoExtension}
- templateFileExtname - ${templateFileExtname}
- templateFileDirname - ${templateFileDirname}
- templateFileDirBasename - ${templateFileDirBasename}
- templateFileFolderName - ${templateFileFolderName}

### Output Files

- outputFile - ${outputFile}
- relativeOutputFile - ${relativeOutputFile}
- relativeOutputFileDirname - ${relativeOutputFileDirname}
- outputFileBasename - ${outputFileBasename}
- outputFileName - ${outputFileName}
- outputFileBasenameNoExtension - ${outputFileBasenameNoExtension}
- outputFileNameNoExtension - ${outputFileNameNoExtension}
- outputFileExtname - ${outputFileExtname}
- outputFileDirname - ${outputFileDirname}
- outputFileFolder - ${outputFileFolder}
- outputFileDirBasename - ${outputFileDirBasename}
- outputFileFolderName - ${outputFileFolderName}

## Helper Methods

- example variables.foobar: $fooBar jazQux$

### Case Converters

- _toAlphaCase - ${_toAlphaCase(variables.foobar)}
- _toNumericCase - ${_toNumericCase(variables.foobar)}
- _toAlphaNumericCase - ${_toAlphaNumericCase(variables.foobar)}
- _toSpaceCase - ${_toSpaceCase(variables.foobar)}
- _toTitleCase - ${_toTitleCase(variables.foobar)}
- _toCamelCase - ${_toCamelCase(variables.foobar)}
- _toPascalCase - ${_toPascalCase(variables.foobar)}
- _toSnakeCase - ${_toSnakeCase(variables.foobar)}
- _toSnakeUpperCase - ${_toSnakeUpperCase(variables.foobar)}
- _toSnakeTitleCase - ${_toSnakeTitleCase(variables.foobar)}
- _toKebabCase - ${_toKebabCase(variables.foobar)}
- _toKebabUpperCase - ${_toKebabUpperCase(variables.foobar)}
- _toKebabTitleCase - ${_toKebabTitleCase(variables.foobar)}
- _toDotCase - ${_toDotCase(variables.foobar)}
- _toDotUpperCase - ${_toDotUpperCase(variables.foobar)}
- _toDotTitleCase - ${_toDotTitleCase(variables.foobar)}
- _toSentenceCase - ${_toSentenceCase(variables.foobar)}
- _toCapitalizedWords - ${_toCapitalizedWords(variables.foobar)}
- _toStudlyCaps - ${_toStudlyCaps(variables.foobar)}
- _toUpperCase - ${_toUpperCase(variables.foobar)}
- _toLowerCase - ${_toLowerCase(variables.foobar)}

### Custom String to Case Converters

 Pass custom string to case converters \$\{_toAlphaCase(\`${variables.foobar}-123-${variables.foobar}\`)\}
- example:
    - _toAlphaCase - ${_toAlphaCase(`${variables.foobar}-123-${variables.foobar}`)}
    - _toNumericCase - ${_toNumericCase(`${variables.foobar}-123-${variables.foobar}`)}
