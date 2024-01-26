"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectDataProvider = void 0;
// dataProviders/ProjectDataProvider.ts
const vscode = __importStar(require("vscode"));
class ProjectDataProvider {
    context;
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    projects;
    constructor(context) {
        this.context = context;
        this.projects = this.loadProjects();
    }
    getTreeItem(element) {
        const treeItem = new vscode.TreeItem(element.name);
        treeItem.iconPath = new vscode.ThemeIcon("file-code");
        treeItem.tooltip = `Project path: ${element.path}`;
        treeItem.contextValue = "project";
        return treeItem;
    }
    getChildren(element) {
        if (element) {
            // Handle children of a project if applicable
            return Promise.resolve([]);
        }
        else {
            return Promise.resolve(this.projects);
        }
    }
    addProject(project) {
        this.projects.push(project);
        this.saveProjects();
        this._onDidChangeTreeData.fire();
    }
    removeProject(projectPath) {
        this.projects = this.projects.filter((p) => p.path !== projectPath);
        this.saveProjects();
        this._onDidChangeTreeData.fire();
    }
    saveProjects() {
        this.context.globalState.update("projects", JSON.stringify(this.projects));
    }
    loadProjects() {
        const projectsJson = this.context.globalState.get("projects");
        if (projectsJson) {
            return JSON.parse(projectsJson);
        }
        return [];
    }
}
exports.ProjectDataProvider = ProjectDataProvider;
//# sourceMappingURL=ProjectDataProvider.js.map