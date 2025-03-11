import { QuickPickItem } from 'vscode';
import * as CaseConverts from './caseConverter';
import { FileTemplate } from './FileTemplate';

export enum Commands {
  CREATE_SAMPLE_TEMPLATE = 'new-file-template.createSampleTemplate',
  NEW_FILES_FROM_TEMPLATE = 'new-file-template.newFilesFromTemplate'
}

export const EXIT = 'Exit';
export const CONTINUE = 'continue';

export type Utils = typeof CaseConverts & {
  log: (message: string, newLine: string, noDate: boolean) => void;
  clearLog: () => void;
  setContext: (context?: Context) => void;
  promptInput: (inputName: string, inputConfig: InputConfig) => unknown;
  getTemplateFileData: (templateFile: string) => Promise<unknown>;
  createOutputFile: (data: string, context: Context) => Promise<void>;
  generateTemplateFile: (templateFile: string) => Promise<void>;
  generateTemplateFiles: (templateFiles: string[]) => Promise<void>;
  generateTemplate: (template: string) => Promise<void>;
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
      newFileTemplate.setContext(...args)
      newFileTemplate.promptInput(...args)
      newFileTemplate.getTemplateFileData(...args)
      newFileTemplate.createOutputFile(...args)
      newFileTemplate.generateTemplateFile(...args)
      newFileTemplate.generateTemplateFiles(...args)
      newFileTemplate.generateTemplate(...args)
    ```
  */
  FileTemplate: typeof FileTemplate;
};

export type PredefinedVariables = Utils & {
  Case: typeof CaseConverts;
  __dirname: string;
  __filename: string;
  process: NodeJS.Process;
  env: NodeJS.Process['env'];
  package: Record<string, unknown>;

  /* Templates */
  allTemplates?: string[];
  allTemplateNames?: string[];
  selectedTemplates?: string[];
  selectedTemplateNames?: string[];
  template?: string;
  relativeTemplate?: string;
  templateBasename?: string;
  templateName?: string;

  /* Template Files */
  allTemplateFiles?: string[];
  allTemplateFileNames?: string[];
  selectedTemplateFiles?: string[];
  selectedTemplateFileNames?: string[];
  templateFile?: string;
  currentTemplateFile?: string;
  relativeTemplateFile?: string;
  relativeTemplateFileDirname?: string;
  templateFileBasename?: string;
  templateFileName?: string;
  templateFileBasenameNoExtension?: string;
  templateFileNameNoExtension?: string;
  templateFileExtname?: string;
  templateFileDirname?: string;
  templateFileDirBasename?: string;
  templateFileFolderName?: string;

  /* Output Files */
  outputFile?: string;
  relativeOutputFile?: string;
  relativeOutputFileDirname?: string;
  relativeTemplateFileToTemplate?: string;
  relativeTemplateFileToTemplateDirname?: string;
  outputFileBasename?: string;
  outputFileName?: string;
  outputFileBasenameNoExtension?: string;
  outputFileNameNoExtension?: string;
  outputFileExtname?: string;
  outputFileDirname?: string;
  outputFileFolder?: string;
  outputFileDirBasename?: string;
  outputFileFolderName?: string;

  /* User Directories */
  userHome?: string;
  cwd: string;
  workspaceFolder: string;
  workspaceFolderBasename: string;
  workspaceFolderName: string;

  /* File System Paths */
  fsPath?: string;
  fsPathFolder?: string;

  /* Folders (if fsPath is a folder) */
  folder?: string;
  relativeFolder?: string;
  folderBasename?: string;
  folderName?: string;

  /* Folders (if fsPath is a file) */
  file?: string;
  fileWorkspaceFolder?: string;
  relativeFile?: string;
  relativeFileDirname?: string;
  fileBasename?: string;
  fileName?: string;
  fileBasenameNoExtension?: string;
  fileNameNoExtension?: string;
  fileExtname?: string;
  fileDirname?: string;
  fileFolder?: string;
  fileDirBasename?: string;
  fileFolderName?: string;

  /* Active Document (if any active document is opened) */
  activeFile?: string;
  activeFileWorkspaceFolder?: string;
  relativeActiveFile?: string;
  relativeActiveFileDirname?: string;
  activeFileBasename?: string;
  activeFileName?: string;
  activeFileBasenameNoExtension?: string;
  activeFileNameNoExtension?: string;
  activeFileExtname?: string;
  activeFileDirname?: string;
  activeFileFolder?: string;
  activeFileDirBasename?: string;
  activeFileFolderName?: string;
};

export interface InputConfig {
  prePrompt?: boolean | ((context: Context) => boolean);
  value?: any;
  title?: string;
  placeHolder?: string;
  options?: string[] | QuickPickItem[];
  validateInput?: string | ((value: unknown, context: Context) => string | undefined);
  transform?: string | ((value: unknown, context: Context) => unknown);
  canPickMany?: boolean;
  matchOnDescription?: boolean;
  matchOnDetail?: boolean;
  ignoreFocusOut?: boolean;
  password?: boolean;
}

export type Hooks = {
  beforeAll?: (context: Context) => Context | false | void;
  beforeEach?: (context: Context) => Context | false | void;
  processBeforeEach?: ({ data, context }: { data: string; context: Context }) => { data: string; context: Context } | false | void;
  processAfterEach?: ({ data, context }: { data: string; context: Context }) => { data: string; context: Context } | false | void;
  afterEach?: (context: Context) => Context | false | void;
  afterAll?: (context: Context) => Context | false | void;
};

export type UserConfig = Hooks & {
  out: string;
  inputValues: Record<string, unknown>;
  variables: Record<string, unknown>;
  overwriteExistingFile?: 'prompt' | 'never' | 'always' | ((context: Context) => 'prompt' | 'never' | 'always');
  promptTemplateFiles?: boolean | ((context: Context) => boolean);
  input: Record<string, InputConfig | ((context: Context) => InputConfig | unknown) | unknown>;
  interpolateTemplateContent?: boolean | ((context: Context) => boolean);
  disableInterpolation?: boolean | ((context: Context) => boolean);
  enableSnippetGeneration?: boolean | ((context: Context) => boolean);
  promptVariablePatterns?: string[] | ((context: Context) => string[]);
  openAfterGeneration?: boolean | string[] | ((context: Context) => string[]);
  include: string[] | ((context: Context) => string[]);
  exclude: string[] | ((context: Context) => string[]);
};

export type Context = PredefinedVariables & UserConfig & Record<Exclude<string, keyof PredefinedVariables & UserConfig>, unknown>;
