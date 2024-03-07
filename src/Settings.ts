import * as fsx from 'fs-extra';
import * as vscode from 'vscode';
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
    static get templatesPath() {
        const resolvedPath = resolveWithWorkspaceFolder(Settings.getSettings('templatesPath') as string || './.vscode/templates');
        if (fsx.existsSync(resolvedPath)) return resolvedPath;
        return resolveWithWorkspaceFolder('./.vscode/templates');
    }
    static get variables() {
        return Settings.getSettings('variables') as Record<string, any> || {};
    }
    static get inputDetails() {
        return Settings.getSettings('inputDetails') as Record<string, any> || {};
    }

    static get shouldOverwriteExistingFile() {
        return Settings.getSettings('overwriteExistingFile') as boolean;
    }
    static set shouldOverwriteExistingFile(value: boolean) {
        Settings.setSettings('overwriteExistingFile', value);
    }
}
