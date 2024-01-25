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
const vscode = __importStar(require("vscode"));
class ProjectDataProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    projects = [];
    getTreeItem(element) {
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
    getChildren(element) {
        if (element) {
            // Here, handle the scenario where you need to return children of a specific project.
            // If projects don't have children in your model, you can just return an empty array.
            return Promise.resolve([]);
        }
        else {
            // Return root elements
            return Promise.resolve(this.projects);
        }
    }
    addProject(project) {
        this.projects.push(project);
        this._onDidChangeTreeData.fire();
    }
    removeProject(projectPath) {
        this.projects = this.projects.filter((project) => project.path !== projectPath);
        this._onDidChangeTreeData.fire();
    }
}
exports.ProjectDataProvider = ProjectDataProvider;
//# sourceMappingURL=ProjectDataProvider.js.map