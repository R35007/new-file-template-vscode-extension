/**
 ** All Available variables
 *
 * @templateDirname - ${templateDirname}
 * @templateBasename - ${templateBasename}
 * @templateName - ${templateName} -> alias \`${templateBasename}\`
 * @templateFile - ${templateFile}
 * @templateFileBaseName - ${templateFileBaseName}
 * @relativeTemplateFile - ${relativeTemplateFile}
 * @userHome - ${userHome} -> ${userHome} -> alias \`process.env.HOME\`
 * @workspaceFolder - ${workspaceFolder}
 * @cwd - ${cwd} -> alias \`${workspaceFolder}\`
 * @workspaceFolderBasename - ${workspaceFolderBasename}
 * @fsPath - ${fsPath}
 * @file - ${file}
 * @fileWorkspaceFolder - ${fileWorkspaceFolder}
 * @relativeFile - ${relativeFile}
 * @relativeFileDirname - ${relativeFileDirname}
 * @fileBasename - ${fileBasename}
 * @fileDirname - ${fileDirname}
 * @fileDirnameBasename - ${fileDirnameBasename}
 * @fileBasenameNoExtension - ${fileBasenameNoExtension}
 * @fileExtname - ${fileExtname}
 * @outputFile - ${outputFile}
 * @outputFileWorkspaceFolder - ${outputFileWorkspaceFolder}
 * @relativeOutputFile - ${relativeOutputFile}
 * @relativeOutputFileDirname - ${relativeOutputFileDirname}
 * @outputFileBasename - ${outputFileBasename}
 * @outputFileBasenameNoExtension - ${outputFileBasenameNoExtension}
 * @outputFileExtname - ${outputFileExtname}
 * @outputFileDirname - ${outputFileDirname}
 * @outputFileDirnameBasename - ${outputFileDirnameBasename}
 *
 ** Dynamic input
 * Note: Input variable must not contain any spaces
 *
 * @componentName - ${input.componentName} -> This prompts the user for 'componentName' if the value of the componentName is not present.
 * @tags - ${input.tags} -> This prompts the multiple choice for the users.
 * @fileName - ${input.fileName} -> This will not prompt the user as the value was predefined in the _config.json -> input.fileName.
 * @inputVariables - ${componentName} ${fileName} ${tags} -> any input variables can also be directly accessed.
 * @inputCaseConversion - ${componentName_toPascalCase} ${componentName_toCamelCase} -> any input variables can be converted to the given case.
 *
 ** Package JSON
 * @version - ${package.version} -> Access package.json at the root of the workspace folder.
 *
 ** Variables
 * @variables - ${JSON.stringify(variables)}
 *
 ** User Input Values
 * @inputValues - ${JSON.stringify(inputValues)}
 *
 ** Node global variables
 *
 * @env - ${process.env.NODE_ENV || 'development'}
 * @date - ${Date.now()}
 * @dateFormatted - ${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}
 * @mathRandomNumber - ${Math.random()}
 * @dirname - ${__dirname}
 * @filename - ${__filename}
 *
 ** Helper methods
 * @example variables.foobar: $fooBar jazQux$
 *
 * @_toAlphaNumericCase - ${_toAlphaNumericCase(variables.foobar)}
 * @_toSpaceCase - ${_toSpaceCase(variables.foobar)}
 * @_toTitleCase - ${_toTitleCase(variables.foobar)}
 * @_toCamelCase - ${_toCamelCase(variables.foobar)}
 * @_toPascalCase - ${_toPascalCase(variables.foobar)}
 * @_toSnakeCase - ${_toSnakeCase(variables.foobar)}
 * @_toSnakeUpperCase - ${_toSnakeUpperCase(variables.foobar)}
 * @_toSnakeTitleCase - ${_toSnakeTitleCase(variables.foobar)}
 * @_toKebabCase - ${_toKebabCase(variables.foobar)}
 * @_toKebabUpperCase - ${_toKebabUpperCase(variables.foobar)}
 * @_toKebabTitleCase - ${_toKebabTitleCase(variables.foobar)}
 * @_toDotCase - ${_toDotCase(variables.foobar)}
 * @_toDotUpperCase - ${_toDotUpperCase(variables.foobar)}
 * @_toDotTitleCase - ${_toDotTitleCase(variables.foobar)}
 * @_toSentenceCase - ${_toSentenceCase(variables.foobar)}
 * @_toCapitalizedWords - ${_toCapitalizedWords(variables.foobar)}
 * @_toStudlyCaps - ${_toStudlyCaps(variables.foobar)}
 * @_toUpperCase - ${_toUpperCase(variables.foobar)}
 * @_toLowerCase - ${_toLowerCase(variables.foobar)}
 *
 ** Pass custom string to case converters
 * @example \$\{_toAlphaCase(\`${variables.foobar}-123-${variables.foobar}\`)\}
 *
 * @_toAlphaCase - ${_toAlphaCase(`${variables.foobar}-123-${variables.foobar}`)}
 * @_toNumericCase - ${_toNumericCase(`${variables.foobar}-123-${variables.foobar}`)}
 *
 * */

export * from './${componentName_toPascalCase}';
