// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FileTemplate } from './FileTemplate';
import { Settings } from './Settings';
import { pickTemplateFolders, promptToCreateNewSampleTemplate } from './inputs';
import { Commands } from './types';
import { getTopLevelFolders } from './utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.CREATE_SAMPLE_TEMPLATE, async () => {
      const newTemplates = FileTemplate.Create();
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Please wait. Creating Sample Template...'
        },
        async () => await newTemplates.createTemplate()
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.NEW_FILES_FROM_TEMPLATE, async (args) => {
      FileTemplate.Destroy();

      const allTemplates = await getTopLevelFolders(Settings.templatePaths);
      if (!allTemplates?.length) return await promptToCreateNewSampleTemplate();

      const selectedTemplates = await pickTemplateFolders(allTemplates);
      if (!selectedTemplates?.length) return;

      for (const template of selectedTemplates) {
        const newTemplates = FileTemplate.Create(args?.fsPath, allTemplates, selectedTemplates);
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Please wait. Generating Template: ${template}...`
          },
          async () => await newTemplates.generateTemplate(template)
        );
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
