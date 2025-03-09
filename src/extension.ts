// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import * as vscode from 'vscode';
import { FileTemplate } from './NewFileTemplate';
import { Settings } from './Settings';
import { pickTemplateFolders, promptToCreateNewSampleTemplate } from './inputs';
import { Commands, Context, EXIT } from './types';
import { getTopLevelFolders, shouldExit } from './utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.CREATE_SAMPLE_TEMPLATE, async () => {
      const newTemplates = new FileTemplate();
      await newTemplates.createTemplate();
    })
  );

  const processTemplates = async (
    args: any,
    template: string,
    allTemplates: string[],
    selectedTemplates: string[],
    instance?: FileTemplate | false
  ) => {
    const context = { templateName: path.basename(template) };
    const newTemplates = instance || new FileTemplate(args?.fsPath, allTemplates, selectedTemplates);
    try {
      await newTemplates.generateTemplate(template);
    } catch (err) {
      if (shouldExit(err, context as Context)) throw Error(EXIT);
    }
  };

  const generateTemplates = async (args: any) => {
    try {
      const allTemplates = await getTopLevelFolders(Settings.templatePaths);
      if (!allTemplates?.length) return await promptToCreateNewSampleTemplate();

      const selectedTemplates = await pickTemplateFolders(allTemplates);
      if (!selectedTemplates?.length) return;

      const instance =
        Settings.promptMultipleTemplates && Settings.useSeparateInstance && new FileTemplate(args?.fsPath, allTemplates, selectedTemplates);
      for (const template of selectedTemplates) {
        await processTemplates(args, template, allTemplates, selectedTemplates, instance);
      }
    } catch (err) {
      if (shouldExit(err)) return;
    }
  };

  context.subscriptions.push(vscode.commands.registerCommand(Commands.NEW_FILES_FROM_TEMPLATE, generateTemplates));
}

// This method is called when your extension is deactivated
export function deactivate() {}
