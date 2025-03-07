import * as fsx from 'fs-extra';
import * as vscode from 'vscode';
import { Context } from './types';
import { resolveWithWorkspaceFolder } from './utils';

export class Settings {
  static get iconsConfiguration() {
    return vscode.workspace.getConfiguration('new-file-template.settings');
  }
  static getSettings(key: string) {
    return Settings.iconsConfiguration.get(key);
  }
  static setSettings(key: string, val: any, isUser = true) {
    return Settings.iconsConfiguration.update(key, val, isUser);
  }
  static get configName() {
    return (Settings.getSettings('configName') as string) || '_config';
  }
  static get templatePaths() {
    const templatePaths = (Settings.getSettings('templatesPaths') as string[]) || ['./.vscode/templates'];
    const resolvedPaths = templatePaths.map(resolveWithWorkspaceFolder);
    const filteredPaths = resolvedPaths.filter(fsx.existsSync);

    if (filteredPaths.length) return [...new Set(filteredPaths)];

    return [resolveWithWorkspaceFolder('./.vscode/templates')];
  }
  static get input() {
    return (Settings.getSettings('input') as Context['input']) || ({} as Context['input']);
  }
  static get variables() {
    return (Settings.getSettings('variables') as Context['variables']) || ({} as Context['variables']);
  }

  static get shouldOverwriteExistingFile() {
    return Settings.getSettings('overwriteExistingFile') as boolean;
  }
  static set shouldOverwriteExistingFile(value: boolean) {
    Settings.setSettings('overwriteExistingFile', value);
  }
  static get promptTemplateFiles() {
    return Settings.getSettings('promptTemplateFiles') as boolean;
  }
  static get shouldInterpolateRequire() {
    return Settings.getSettings('shouldInterpolateTemplateString') as boolean;
  }
  static get allowCursorPlacement() {
    return Settings.getSettings('allowCursorPlacement') as boolean;
  }
  static get vscodeTemplatePath() {
    return resolveWithWorkspaceFolder('./.vscode/templates') as string;
  }
}
