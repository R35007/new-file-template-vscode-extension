import * as fsx from 'fs-extra';
import * as vscode from 'vscode';
import { TemplateConfig } from './constants';
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
    return (Settings.getSettings('input') as TemplateConfig['input']) || ({} as TemplateConfig['input']);
  }
  static get variables() {
    return (Settings.getSettings('variables') as TemplateConfig['variables']) || ({} as TemplateConfig['variables']);
  }

  static get shouldOverwriteExistingFile() {
    return Settings.getSettings('overwriteExistingFile') as boolean;
  }
  static get promptTemplateFiles() {
    return Settings.getSettings('promptTemplateFiles') as boolean;
  }
  static set shouldOverwriteExistingFile(value: boolean) {
    Settings.setSettings('overwriteExistingFile', value);
  }
  static get vscodeTemplatePath() {
    return resolveWithWorkspaceFolder('./.vscode/templates') as string;
  }
}
