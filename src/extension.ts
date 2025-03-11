// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FileTemplate } from './FileTemplate';
import { Settings } from './Settings';
import { pickTemplateFolders, promptToCreateNewSampleTemplate } from './inputs';
import { Commands, EXIT } from './types';
import { getTopLevelFolders, shouldExit } from './utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.CREATE_SAMPLE_TEMPLATE, async () => {
      try {
        const newTemplates = FileTemplate.Create();
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Please wait. Creating Sample Template...'
          },
          async () => await newTemplates.createTemplate()
        );
      } catch (err) {
        if (shouldExit(err, undefined, console.error)) return;
      }
    })
  );

  const generateTemplates = async (args: any) => {
    try {
      FileTemplate.Destroy();

      const allTemplates = await getTopLevelFolders(Settings.templatePaths);
      if (!allTemplates?.length) return await promptToCreateNewSampleTemplate();

      const selectedTemplates = await pickTemplateFolders(allTemplates);
      if (!selectedTemplates?.length) return;

      for (const template of selectedTemplates) {
        const newTemplates = FileTemplate.Create(args?.fsPath, allTemplates, selectedTemplates);
        try {
          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Please wait. Generating Template: ${template}...`
            },
            async () => await newTemplates.generateTemplate(template)
          );
        } catch (err) {
          if (shouldExit(err, newTemplates.context, console.error)) throw Error(EXIT);
        }
      }
    } catch (err) {
      if (shouldExit(err, undefined, console.error)) return;
    }
  };

  context.subscriptions.push(vscode.commands.registerCommand(Commands.NEW_FILES_FROM_TEMPLATE, generateTemplates));
}

// This method is called when your extension is deactivated
export function deactivate() {}
