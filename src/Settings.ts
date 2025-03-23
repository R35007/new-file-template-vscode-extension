import * as vscode from 'vscode';
import { resolveWithWorkspaceFolder } from './FileTemplate/utils';
import { Context } from './types';

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
  static get configPath() {
    return Settings.getSettings('configPath') as string;
  }
  static get templatePaths() {
    const templatePaths = (Settings.getSettings('templatePaths') as string[]) || ['./.vscode/templates'];
    const resolvedPaths = templatePaths.map(resolveWithWorkspaceFolder);

    if (resolvedPaths.length) return [...new Set(resolvedPaths)];

    return [resolveWithWorkspaceFolder('./.vscode/templates')];
  }
  static get overwriteExistingFile() {
    return (Settings.getSettings('overwriteExistingFile') as 'prompt' | 'never' | 'always') || 'prompt';
  }
  static set overwriteExistingFile(value: 'prompt' | 'never' | 'always') {
    Settings.setSettings('overwriteExistingFile', value);
  }

  static get promptMultipleTemplates() {
    return Settings.getSettings('promptMultipleTemplates') as boolean;
  }
  static get useSeparateInstance() {
    return Settings.getSettings('useSeparateInstance') as boolean;
  }
  static get promptTemplateFiles() {
    return Settings.getSettings('promptTemplateFiles') as boolean;
  }
  static get disableInterpolationErrorMessage() {
    return Settings.getSettings('disableInterpolationErrorMessage') as boolean;
  }
  static get interpolateByLine() {
    return Settings.getSettings('interpolateByLine') as boolean;
  }
  static get disableInterpolation() {
    return Settings.getSettings('disableInterpolation') as boolean;
  }
  static get promptVariablePatterns() {
    return (Settings.getSettings('promptVariablePatterns') as string[]) || ['\\$\\{input\\.([^\\}]+)\\}'];
  }
  static get enableSnippetGeneration() {
    return Settings.getSettings('enableSnippetGeneration') as boolean;
  }
  static get openAfterGeneration() {
    return Settings.getSettings('openAfterGeneration') as boolean;
  }
  static get inputConfig() {
    return (Settings.getSettings('inputConfig') as Context['inputConfig']) || ({} as Context['inputConfig']);
  }
  static get variables() {
    return (Settings.getSettings('variables') as Context['variables']) || ({} as Context['variables']);
  }
}
