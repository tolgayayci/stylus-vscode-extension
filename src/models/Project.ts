import * as vscode from "vscode";

export class Project extends vscode.TreeItem {
  commands: any; // This should hold the command structure

  constructor(
    public readonly name: string,
    public readonly path: string,
    commands: any
  ) {
    super(name, vscode.TreeItemCollapsibleState.Collapsed);
    this.commands = commands;
  }
}
