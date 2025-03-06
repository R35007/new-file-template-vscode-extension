import { QuickPickItem } from 'vscode';
import * as CaseConverts from './caseConverter';

export enum Commands {
  CREATE_SAMPLE_TEMPLATE = 'new-file-template.createSampleTemplate',
  NEW_FILES_FROM_TEMPLATE = 'new-file-template.newFilesFromTemplate'
}

export const EXIT = 'Exit';
export const CONTINUE = 'continue';

type PredefinedVariables = typeof CaseConverts & {
  __dirname: string;
  __filename: string;
  process: NodeJS.Process;
  env: NodeJS.Process['env'];
  package: Record<string, unknown>;

  /* Templates */
  allTemplates?: string[];
  templates?: string[];
  template?: string;
  relativeTemplate?: string;
  templateBasename?: string;
  templateName?: string;

  /* Template Files */
  allTemplateFiles?: string[];
  templateFiles?: string[];
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
};

export interface InputConfig {
  when?: (context: Context) => boolean | undefined; // if false, skip this input, if undefined then prompt on demand
  promptAlways?: boolean; // always prompts even if value is present
  value?: any;
  title?: string;
  placeHolder?: string;
  options?: string[] | QuickPickItem[];
  validator?: string;
  afterInput?: string;
  validateInput?: (value: unknown, context: Context) => string | undefined;
  transform?: (value: unknown, context: Context) => unknown;
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
  variables: Record<string, unknown>;
  inputValues: Record<string, unknown>;
  input: Record<string, InputConfig | unknown>;
  exclude: string[] | ((context: Context) => string[]);
  include: string[] | ((context: Context) => string[]);
  out: string;
  promptTemplateFiles: boolean;
};

export type Context = PredefinedVariables & UserConfig & Record<Exclude<string, keyof PredefinedVariables & UserConfig>, unknown>;
