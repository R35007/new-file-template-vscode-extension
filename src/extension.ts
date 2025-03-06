// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NewTemplates } from './NewFileTemplate';
import { Commands } from './types';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.CREATE_SAMPLE_TEMPLATE, async () => {
      const newTemplates = new NewTemplates();
      await newTemplates.createTemplate();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.NEW_FILES_FROM_TEMPLATE, async (args) => {
      const newTemplates = new NewTemplates();
      await newTemplates.generateTemplates(args);
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
