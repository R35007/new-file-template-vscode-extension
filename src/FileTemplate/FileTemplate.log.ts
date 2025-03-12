import * as vscode from 'vscode';

const formatTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
  return `[${formattedHours}:${minutes}:${seconds}.${milliseconds}]`;
};

const output = vscode.window.createOutputChannel('New File Template');

export const log = (message: string, newLine: string = '', noDate: boolean = false) => {
  const formattedTime = formatTime(new Date());
  const logMessage = noDate ? message : `${formattedTime} ${message}`;
  output.appendLine(`${newLine}${logMessage}`);
};
export const clearLog = output.clear;
