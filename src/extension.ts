// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import * as vscode from 'vscode';
import { FileTemplate } from './FileTemplate/FileTemplate';
import { log } from './FileTemplate/FileTemplate.log';
import { getTopLevelFolders } from './FileTemplate/utils';
import { pickTemplateFolders, promptToCreateNewSampleTemplate } from './FileTemplate/utils/prompts';
import { Settings } from './Settings';
import { Commands } from './types';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  log('********************************************************', '', true);
  log('*                                                      *', '', true);
  log('*  🎉 Welcome to the New File Template Extension! 🎉  *', '', true);
  log('*                                                      *', '', true);
  log('*  We hope you enjoy using this tool!                  *', '', true);
  log('*  Have fun creating awesome templates!                *', '', true);
  log('*                                                      *', '', true);
  log('********************************************************\n', '', true);

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
        // do nothing here
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.NEW_FILES_FROM_TEMPLATE, async (args) => {
      try {
        FileTemplate.Destroy();

        const allTemplates = getTopLevelFolders(Settings.templatePaths);
        if (!allTemplates?.length) return await promptToCreateNewSampleTemplate();

        const selectedTemplates = await pickTemplateFolders(allTemplates);
        if (!selectedTemplates?.length) return;

        for (const [templateIndex, template] of selectedTemplates.entries()) {
          const newTemplates = FileTemplate.Create(args?.fsPath, allTemplates, selectedTemplates);
          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Please wait. Generating Template: ${path.basename(template)}...`
            },
            async () => await newTemplates.generateTemplate(template, { templateIndex })
          );
        }
      } catch (err) {
        // do nothing here
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
