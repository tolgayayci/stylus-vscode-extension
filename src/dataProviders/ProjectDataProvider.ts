// dataProviders/ProjectDataProvider.ts
import * as vscode from "vscode";
import { Project } from "../models/Project";

export class ProjectDataProvider implements vscode.TreeDataProvider<Project> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Project | undefined | void
  > = new vscode.EventEmitter<Project | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Project | undefined | void> =
    this._onDidChangeTreeData.event;

  public projects: Project[];

  constructor(private context: vscode.ExtensionContext) {
    this.projects = this.loadProjects();
  }

  getTreeItem(element: Project): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    treeItem.iconPath = new vscode.ThemeIcon("file-code");
    treeItem.tooltip = `Project path: ${element.path + element.name}`;
    treeItem.contextValue = "project";
    return treeItem;
  }

  getChildren(element?: Project): Thenable<Project[]> {
    if (element) {
      // Handle children of a project if applicable
      return Promise.resolve([]);
    } else {
      return Promise.resolve(this.projects);
    }
  }

  addProject(project: Project) {
    this.projects.push(project);
    this.saveProjects();
    this._onDidChangeTreeData.fire();
  }

  removeProject(projectPath: string) {
    this.projects = this.projects.filter((p) => p.path !== projectPath);
    this.saveProjects();
    this._onDidChangeTreeData.fire();
  }

  private saveProjects() {
    this.context.globalState.update("projects", JSON.stringify(this.projects));
  }

  private loadProjects(): Project[] {
    const projectsJson = this.context.globalState.get<string>("projects");
    if (projectsJson) {
      return JSON.parse(projectsJson);
    }
    return [];
  }
}
