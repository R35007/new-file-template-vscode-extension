import * as path from 'path';
import * as vscode from 'vscode';

export function normalizeSeparator<T extends Record<string, string> | string>(object: T): T {
  if (typeof object === 'string') return object.replace(/\\/g, '/') as T;
  else return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, value.replace(/\\/g, '/')])) as T;
}

export function getWorkSpaceFolder(filePath: string = '') {
  const activePath: string = filePath.replace(/\\/g, '/') || '';
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  if (!activePath?.trim().length) return workspaceFolders[0]?.uri.fsPath.replace(/\\/g, '/') || './';
  return workspaceFolders.map((folder) => folder.uri.fsPath).find((folder) => activePath.includes(folder.replace(/\\/g, '/'))) || './';
}

export const getWorkSpaceFolderDetails = (filePath: string = '') =>
  normalizeSeparator({
    cwd: getWorkSpaceFolder(filePath),
    workspaceFolder: getWorkSpaceFolder(filePath),
    workspaceFolderBasename: path.basename(getWorkSpaceFolder(filePath)),
    workspaceFolderName: path.basename(getWorkSpaceFolder(filePath))
  });

export function getFSPathDetails(fsPath: string = ''): Record<string, string> {
  const wfd = getWorkSpaceFolderDetails(fsPath);

  const folderDetails = {
    folder: fsPath,
    relativeFolder: path.relative(wfd.workspaceFolder, fsPath),
    folderBasename: path.basename(fsPath),
    folderName: path.basename(fsPath)
  };

  const fileDetails = {
    file: fsPath,
    fileWorkspaceFolder: wfd.workspaceFolder,
    relativeFile: path.relative(wfd.workspaceFolder, fsPath),
    relativeFileDirname: path.relative(wfd.workspaceFolder, path.dirname(fsPath)),
    fileBasename: path.basename(fsPath),
    fileName: path.basename(fsPath),
    fileBasenameNoExtension: path.basename(fsPath, path.extname(fsPath)),
    fileNameNoExtension: path.basename(fsPath, path.extname(fsPath)),
    fileExtname: path.extname(fsPath),
    fileDirname: path.dirname(fsPath),
    fileFolder: path.dirname(fsPath),
    fileDirBasename: path.basename(path.dirname(fsPath)),
    fileFolderName: path.basename(path.dirname(fsPath))
  };

  return normalizeSeparator({
    fsPath,
    ...folderDetails,
    ...fileDetails
  });
}

export function getActiveFileDetails() {
  const activeEditor = vscode.window.activeTextEditor;

  const activeDocument = activeEditor?.document;
  const fsPath = activeDocument?.uri?.fsPath;

  const fsd = getFSPathDetails(fsPath);

  return normalizeSeparator({
    activeFile: fsd.file,
    activeFileWorkspaceFolder: fsd.fileWorkspaceFolder,
    relativeActiveFile: fsd.relativeFile,
    relativeActiveFileDirname: fsd.relativeFileDirname,
    activeFileBasename: fsd.fileBasename,
    activeFileName: fsd.fileName,
    activeFileBasenameNoExtension: fsd.fileBasenameNoExtension,
    activeFileNameNoExtension: fsd.fileNameNoExtension,
    activeFileExtname: fsd.fileExtname,
    activeFileDirname: fsd.fileDirname,
    activeFileFolder: fsd.fileFolder,
    activeFileDirBasename: fsd.fileDirBasename,
    activeFileFolderName: fsd.fileFolderName
  });
}

export const getTemplatePathDetails = (workspaceFolder: string, template: string = '') =>
  normalizeSeparator({
    template,
    relativeTemplate: path.relative(workspaceFolder, template),
    templateBasename: path.basename(template),
    templateName: path.basename(template)
  });

export const getTemplateFilePathDetails = (workspaceFolder: string, templateFile: string = '') =>
  normalizeSeparator({
    templateFile,
    relativeTemplateFile: path.relative(workspaceFolder, templateFile),
    relativeTemplateFileDirname: path.relative(workspaceFolder, path.dirname(templateFile)),
    templateFileBasename: path.basename(templateFile),
    templateFileName: path.basename(templateFile),
    templateFileBasenameNoExtension: path.basename(templateFile, path.extname(templateFile)),
    templateFileNameNoExtension: path.basename(templateFile, path.extname(templateFile)),
    templateFileExtname: path.extname(templateFile),
    templateFileDirname: path.dirname(templateFile),
    templateFileDirBasename: path.basename(path.dirname(templateFile)),
    templateFileFolderName: path.basename(path.dirname(templateFile))
  });

export const getOutputFilePathDetails = (workspaceFolder: string, outputFile: string = '') =>
  normalizeSeparator({
    outputFile,
    relativeOutputFile: path.relative(workspaceFolder, outputFile),
    relativeOutputFileDirname: path.relative(workspaceFolder, path.dirname(outputFile)),
    outputFileBasename: path.basename(outputFile),
    outputFileName: path.basename(outputFile),
    outputFileBasenameNoExtension: path.basename(outputFile, path.extname(outputFile)),
    outputFileNameNoExtension: path.basename(outputFile, path.extname(outputFile)),
    outputFileExtname: path.extname(outputFile),
    outputFileDirname: path.dirname(outputFile),
    outputFileFolder: path.dirname(outputFile),
    outputFileDirBasename: path.basename(path.dirname(outputFile)),
    outputFileFolderName: path.basename(path.dirname(outputFile))
  });
