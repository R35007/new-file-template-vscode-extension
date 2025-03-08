import * as fsx from 'fs-extra';
import * as path from 'path';
import { Context } from './types';
import { isPlainObject } from './utils';
import * as vscode from 'vscode';

async function getConfigData(filePath: string, context?: Context) {
  if (filePath.endsWith('.json')) return fsx.readJson(filePath);
  else if (filePath.endsWith('.js')) {
    delete require.cache[require.resolve(filePath)];
    const module = require(filePath);
    if (typeof module === 'function') return module(context);
    if (isPlainObject(module)) return module;
  }
}

function getConfigFromPath(configPath: string, context?: Context) {
  if (!fsx.existsSync(configPath)) return;

  const stats = fsx.statSync(configPath);

  if (stats.isFile()) return getConfigData(configPath, context);

  const indexPath = path.join(configPath, 'index.js');
  if (fsx.existsSync(indexPath)) return getConfigData(indexPath, context);
}

function getConfigFromTemplate(templatePath: string, context?: Context) {
  const configJsonPath = path.join(templatePath, '_config.json');
  if (fsx.existsSync(configJsonPath)) return fsx.readJson(configJsonPath);

  const configJsPath = path.join(templatePath, '_config.js');
  if (fsx.existsSync(configJsPath)) return getConfigData(configJsPath, context);

  const configFolderPath = path.join(templatePath, '_config');
  if (fsx.existsSync(configFolderPath) && fsx.statSync(configFolderPath).isDirectory()) {
    const indexPath = path.join(configFolderPath, 'index.js');
    if (fsx.existsSync(indexPath)) return getConfigData(indexPath, context);
  }
}

export async function getTemplateConfig(templatePath: string, configPath: string, context?: Context): Promise<Context | undefined> {
  try {
    const config = getConfigFromPath(configPath, context) || getConfigFromTemplate(templatePath, context);
    return config;
  } catch (err) {
    if (err instanceof Error) vscode.window.showErrorMessage(err.message);
    console.log(err);
  }
}
