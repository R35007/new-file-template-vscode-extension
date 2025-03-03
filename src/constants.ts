import { QuickPickItem } from 'vscode';
import * as CaseConverts from './caseConverter';

export enum Commands {
  CREATE_SAMPLE_TEMPLATE = 'new-file-template.createSampleTemplate',
  NEW_FILES_FROM_TEMPLATE = 'new-file-template.newFilesFromTemplate'
}

export const EXIT_CODE = 'Exit';

export interface InputConfig {
  when?: (config: TemplateConfig) => boolean | undefined; // if false, skip this input, if undefined then prompt on demand
  promptAlways?: boolean; // always prompts even if value is present
  value?: any;
  title?: string;
  placeHolder?: string;
  options?: string[] | QuickPickItem[];
  validator?: string;
  afterInput?: string;
  validateInput?: (value: unknown, config: TemplateConfig) => string | undefined;
  transform?: (value: unknown, config: TemplateConfig) => unknown;
  canPickMany?: boolean;
  matchOnDescription?: boolean;
  matchOnDetail?: boolean;
  ignoreFocusOut?: boolean;
  password?: boolean;
}

type PredefinedTemplateConfig = typeof CaseConverts & {
  process: NodeJS.Process;
  __dirname: string;
  __filename: string;
  package: Record<string, unknown>;
  templateDirname?: string;
  templateBasename?: string;
  templateName?: string;
  templateFile?: string;
  templateFileBaseName?: string;
  relativeTemplateFile?: string;
  userHome?: string;
  workspaceFolder: string;
  cwd: string;
  workspaceFolderBasename: string;
  fsPath?: string;
  file?: string;
  fileWorkspaceFolder: string;
  relativeFile?: string;
  relativeFileDirname?: string;
  fileBasename?: string;
  fileDirname?: string;
  fileDirnameBasename?: string;
  fileBasenameNoExtension?: string;
  fileExtname?: string;
  outputFile?: string;
  outputFileWorkspaceFolder?: string;
  relativeOutputFile?: string;
  relativeOutputFileDirname?: string;
  outputFileBasename?: string;
  outputFileBasenameNoExtension?: string;
  outputFileExtname?: string;
  outputFileDirname?: string;
  outputFileDirnameBasename?: string;
};

export type TemplateConfig = PredefinedTemplateConfig & {
  beforeAll?: (config: TemplateConfig) => TemplateConfig | false | void;
  beforeEach?: (config: TemplateConfig) => TemplateConfig | false | void;
  afterEach?: (config: TemplateConfig) => TemplateConfig | false | void;
  afterAll?: (config: TemplateConfig) => TemplateConfig | false | void;
  variables: Record<string, unknown>;
  input: InputConfig;
  inputValues: Record<string, unknown>;
  exclude?: string[];
  out?: string;
} & Record<string, unknown>;
