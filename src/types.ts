import { QuickPickItem } from "vscode";

export enum Commands {
  CREATE_SAMPLE_TEMPLATE = "new-file-template.createSampleTemplate",
  NEW_FILES_FROM_TEMPLATE = "new-file-template.newFilesFromTemplate",
}

export interface InputConfig {
  promptAlways?: boolean;
  value?: string;
  title?: string;
  placeHolder?: string;
  options?: string[] | QuickPickItem[];
  validator?: string;
  afterInput?: string;
}
