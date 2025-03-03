// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NewTemplates } from './NewFileTemplate';
import { Commands, EXIT_CODE } from './constants';
import { getTemplateConfig, pickTemplateFolders } from './utils';

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
      const selectedTemplates = await pickTemplateFolders();
      if (!selectedTemplates?.length) return;

      const commonConfig = await getTemplateConfig();
      const newTemplates = new NewTemplates(commonConfig);

      for (const template of selectedTemplates) {
        try {
          await newTemplates.newFilesFromTemplate(args, template.value);
        } catch (err) {
          if (!(err instanceof Error) || err.message === EXIT_CODE) return;
          vscode.window.showErrorMessage(err.message);
          console.error(err);
        }
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
