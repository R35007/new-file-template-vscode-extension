/**
 * All Available variables
 * 
 * @userHome ${userHome}
 * @workspaceFolder ${workspaceFolder}
 * @cwd ${cwd}
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
 * 
 * @input ${input.componentName} -> This prompts the user for 'componentName' if the value of the componentName is not present.
 * @inputCase ${componentName_toPascalCase} ${componentName_toCamelCase}  
 * @package ${package.version}
 * @env ${env.USERNAME}
 * @variables ${variables.lorem}
 * @date ${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}
 * 
 * Helper methods
 * @toAlphaNumericCase ${_.toAlphaNumericCase(variables.foobar)}
 * @toSnakeCase ${_.toSnakeCase(variables.foobar)}
 * @toCamelCase ${_.toCamelCase(variables.foobar)}
 * @toPascalCase ${_.toPascalCase(variables.foobar)}
 * @toKebabCase ${_.toKebabCase(variables.foobar)}
 * @toTitleCase ${_.toTitleCase(variables.foobar)}
 * @toSentenceCase ${_.toSentenceCase(variables.foobar)}
 * @toUppercase ${_.toUppercase(variables.foobar)}
 * @toLowercase ${_.toLowercase(variables.foobar)}
 * @toCapitalizedWords ${_.toCapitalizedWords(variables.foobar)}
 * @toStudlyCaps ${_.toStudlyCaps(variables.foobar)}
 * @toTrainCase ${_.toTrainCase(variables.foobar)}
 * @toScreamingSnakeCase ${_.toScreamingSnakeCase(variables.foobar)}
 * @toScreamingKebabCase ${_.toScreamingKebabCase(variables.foobar)}
 * @toDotCase ${_.toDotCase(variables.foobar)}
 * @toSuperTitleCase ${_.toSuperTitleCase(variables.foobar)}
 * 
 * */

export * from "./${componentName}"
