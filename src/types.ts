import { QuickPickItem, window } from 'vscode';
import * as Case from './FileTemplate/Case';
import { FileTemplate } from './FileTemplate/FileTemplate';

export enum Commands {
  CREATE_SAMPLE_TEMPLATE = 'new-file-template.createSampleTemplate',
  NEW_FILES_FROM_TEMPLATE = 'new-file-template.newFilesFromTemplate'
}

export const EXIT = 'Exit';
export const CONTINUE = 'continue';

export type Utils = typeof Case & {
  log: (message: string, newLine?: string, noDate?: boolean) => void;
  clearLog: () => void;
  setContext: (context?: Context) => void;
  promptInput: (inputName: string, inputConfig: InputConfig) => unknown;
  readFile: (templateFile: string, context: Partial<Context>) => Promise<string>;
  getTemplateFileData: (templateFile: string, context?: Partial<Context>) => Promise<string | false>;
  createOutputFile: (data: string, contextOrOutputFile?: Partial<Context> | string) => Promise<void>;
  generateTemplateFile: (templateFile: string, contextOrOutputFile?: Partial<Context> | string) => Promise<void>;
  generateTemplateFiles: (templateFiles: string[], context?: Partial<Context>) => Promise<void>;
  generateTemplate: (template: string, context?: Partial<Context>) => Promise<void>;
  interpolate: (template: string, context: Context, hideError?: boolean, interpolateByLine?: boolean) => string;
  showInformationMessage: typeof window.showInformationMessage;
  showErrorMessage: typeof window.showErrorMessage;
  showWarningMessage: typeof window.showWarningMessage;
  Case: typeof Case;
  FileTemplate: typeof FileTemplate;
};

export type PredefinedVariables = Utils & {
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
  templateIndex?: number;
  relativeTemplate?: string;
  templateBasename?: string;
  templateName?: string;

  /* Template Files */
  allTemplateFiles?: string[];
  allTemplateFileNames?: string[];
  selectedTemplateFiles?: string[];
  selectedTemplateFileNames?: string[];
  templateFile?: string;
  templateFileIndex?: number;
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

  /* Parsed Template Files */
  parsedTemplateFile?: string;
  currentParsedTemplateFile?: string;
  relativeParsedTemplateFile?: string;
  relativeParsedTemplateFileDirname?: string;
  relativeParsedTemplateFileToTemplate?: string;
  relativeParsedTemplateFileToTemplateDirname?: string;
  parsedTemplateFileBasename?: string;
  parsedTemplateFileName?: string;
  parsedTemplateFileBasenameNoExtension?: string;
  parsedTemplateFileNameNoExtension?: string;
  parsedTemplateFileExtname?: string;
  parsedTemplateFileDirname?: string;
  parsedTemplateFileDirBasename?: string;
  parsedTemplateFileFolderName?: string;

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
  isFile?: boolean;
  isFolder?: boolean;
  isDirectory?: boolean;

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
  beforeAll?: (context: Context) => Promise<Context | false | void>;
  beforeEach?: (context: Context) => Promise<Context | false | void>;
  processBeforeEach?: ({ data, context }: { data: string; context: Context }) => Promise<{ data: string; context: Context } | false | void>;
  processAfterEach?: ({ data, context }: { data: string; context: Context }) => Promise<{ data: string; context: Context } | false | void>;
  afterEach?: (context: Context) => Promise<Context | false | void>;
  afterAll?: (context: Context) => Promise<Context | false | void>;
};

export type UserConfig = Hooks & {
  out: string;
  inputValues: Record<string, unknown>;
  variables: Record<string, unknown>;
  input: Record<string, InputConfig | ((context: Context) => Promise<InputConfig | unknown>) | unknown>;
  overwriteExistingFile?: 'prompt' | 'never' | 'always' | ((context: Context) => Promise<'prompt' | 'never' | 'always'>);
  promptTemplateFiles?: boolean | ((context: Context) => Promise<boolean>);
  enableSnippetGeneration?: boolean | ((context: Context) => Promise<boolean>);
  interpolateByLine?: boolean | ((context: Context) => Promise<boolean>);
  disableInterpolation?: boolean | ((context: Context) => Promise<boolean>);
  disableInterpolationErrorMessage?: boolean | ((context: Context) => Promise<boolean>);
  promptVariablePatterns?: string[] | ((context: Context) => Promise<string[]>);
  openAfterGeneration?: boolean | string[] | ((context: Context) => Promise<string[]>);
  include: string[] | ((context: Context) => Promise<string[]>);
  exclude: string[] | ((context: Context) => Promise<string[]>);
  times:
    | number
    | ((context: Context) => Promise<false | number | Array<false | Context | ((context: Context) => Promise<Partial<Context>>)>>);
};

export type Context = PredefinedVariables & UserConfig & Record<Exclude<string, PredefinedVariables & UserConfig>, unknown>;
