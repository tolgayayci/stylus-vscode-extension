import * as vscode from "vscode";
import { Project } from "../models/Project";

export class ProjectDataProvider implements vscode.TreeDataProvider<Project> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Project | undefined | void
  > = new vscode.EventEmitter<Project | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Project | undefined | void> =
    this._onDidChangeTreeData.event;

  public projects: Project[] = [];

  getTreeItem(element: Project): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    treeItem.command = {
      command: "stylusWorkspace.openProjectFolder",
      title: "Open Project",
      arguments: [element.path], // Assuming 'path' is a property of the Project model
    };

    // Set an icon for the remove action
    treeItem.iconPath = new vscode.ThemeIcon("delete"); // Using a built-in 'delete' icon

    // Add a tooltip
    treeItem.tooltip = `Remove ${element.name}`;

    // Context value used for showing conditional commands in the context menu
    treeItem.contextValue = "project";

    return treeItem;
  }

  getChildren(element?: Project): Thenable<Project[]> {
    if (element) {
      // Here, handle the scenario where you need to return children of a specific project.
      // If projects don't have children in your model, you can just return an empty array.
      return Promise.resolve([]);
    } else {
      // Return root elements
      return Promise.resolve(this.projects);
    }
  }

  addProject(project: Project) {
    this.projects.push(project);
    this._onDidChangeTreeData.fire();
  }

  removeProject(projectPath: string) {
    this.projects = this.projects.filter(
      (project) => project.path !== projectPath
    );
    this._onDidChangeTreeData.fire();
  }
}
