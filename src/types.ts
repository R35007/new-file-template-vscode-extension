import { QuickPickItem } from 'vscode';
import * as CaseConverts from './caseConverter';
import { NewFileTemplate } from './NewFileTemplate';

export enum Commands {
  CREATE_SAMPLE_TEMPLATE = 'new-file-template.createSampleTemplate',
  NEW_FILES_FROM_TEMPLATE = 'new-file-template.newFilesFromTemplate'
}

export const EXIT = 'Exit';
export const CONTINUE = 'continue';

type PredefinedVariables = typeof CaseConverts & {
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

  promptInput?: (inputName: string, inputConfig: InputConfig) => unknown;
  NewFileTemplate: typeof NewFileTemplate;
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

export type UserConfig = {
  beforeAll?: (context: Context) => Context | false | void;
  beforeEach?: (context: Context) => Context | false | void;
  processBeforeEach?: ({ data, context }: { data: string; context: Context }) => { data: string; context: Context } | false | void;
  processAfterEach?: ({ data, context }: { data: string; context: Context }) => { data: string; context: Context } | false | void;
  afterEach?: (context: Context) => Context | false | void;
  afterAll?: (context: Context) => Context | false | void;
  out: string;
  inputValues: Record<string, unknown>;
  variables: Record<string, unknown>;
  input: Record<string, InputConfig | ((context: Context) => InputConfig | unknown) | unknown>;
  overwriteExistingFile?: 'prompt' | 'never' | 'always';
  promptTemplateFiles?: boolean;
  interpolateTemplateContent?: boolean;
  enableSnippetGeneration?: boolean | ((context: Context) => boolean);
  openAfterGeneration?: boolean | string[] | ((context: Context) => string[]);
  include: string[] | ((context: Context) => string[]);
  exclude: string[] | ((context: Context) => string[]);
};

export type Context = PredefinedVariables & UserConfig & Record<Exclude<string, keyof PredefinedVariables & UserConfig>, unknown>;
