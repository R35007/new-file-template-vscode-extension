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
  static get configPath() {
    return Settings.getSettings('configPath') as string;
  }
  static get templatePaths() {
    const templatePaths = (Settings.getSettings('templatePaths') as string[]) || ['./.vscode/templates'];
    const resolvedPaths = templatePaths.map(resolveWithWorkspaceFolder);
    const filteredPaths = resolvedPaths.filter(fsx.existsSync);

    if (filteredPaths.length) return [...new Set(filteredPaths)];

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
  static get disableInterpolation() {
    return Settings.getSettings('disableInterpolation') as boolean;
  }
  static get promptVariablePatterns() {
    return (Settings.getSettings('promptVariablePatterns') as string[]) || ['\\$\\{input\\.([^\\}]+)\\}'];
  }
  static get interpolateTemplateContent() {
    return Settings.getSettings('interpolateTemplateContent') as boolean;
  }
  static get enableSnippetGeneration() {
    return Settings.getSettings('enableSnippetGeneration') as boolean;
  }
  static get openAfterGeneration() {
    return Settings.getSettings('openAfterGeneration') as boolean;
  }
  static get input() {
    return (Settings.getSettings('input') as Context['input']) || ({} as Context['input']);
  }
  static get vscodeTemplatePath() {
    return resolveWithWorkspaceFolder('./.vscode/templates') as string;
  }
  static get variables() {
    return (Settings.getSettings('variables') as Context['variables']) || ({} as Context['variables']);
  }
}
