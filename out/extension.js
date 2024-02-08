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
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
//Commands
const createNewProject_1 = require("./commands/createNewProject");
const addExistingProject_1 = require("./commands/addExistingProject");
const exportAbi_1 = require("./commands/exportAbi");
const check_1 = require("./commands/check");
const deploy_1 = require("./commands/deploy");
const replay_1 = require("./commands/replay");
const trace_1 = require("./commands/trace");
//Data Providers
const ProjectDataProvider_1 = require("./dataProviders/ProjectDataProvider");
const ChatViewProvider_1 = require("./dataProviders/ChatViewProvider");
//Utils
const checkCargoStylus_1 = require("./utils/checkCargoStylus");
function activate(context) {
    //Data Provider for the project view
    const projectDataProvider = new ProjectDataProvider_1.ProjectDataProvider(context);
    vscode.window.registerTreeDataProvider("projectView", projectDataProvider);
    //Stylus GPT View
    const chatViewProvider = new ChatViewProvider_1.ChatViewProvider(context.extensionUri, context);
    vscode.window.registerWebviewViewProvider(ChatViewProvider_1.ChatViewProvider.viewType, chatViewProvider);
    (0, checkCargoStylus_1.checkCargoStylus)()
        .then(() => {
        // Command to create a new project
        let disposableCreateProject = vscode.commands.registerCommand("stylusWorkspace.createNewProject", () => {
            (0, createNewProject_1.createNewProjectHandler)(projectDataProvider);
        });
        // Command to add an existing project
        let disposableAddExistingProject = vscode.commands.registerCommand("stylusWorkspace.addExistingProject", () => {
            (0, addExistingProject_1.addExistingProjectHandler)(projectDataProvider);
        });
        let disposableOpenProject = vscode.commands.registerCommand("stylusWorkspace.openProjectFolder", (project) => {
            vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(project.path), true);
        });
        let disposableRemoveProjectFromView = vscode.commands.registerCommand("stylusWorkspace.removeProjectFromView", (project) => {
            if (project && project.path) {
                projectDataProvider.removeProject(project.path);
            }
        });
        let disposableExportApi = vscode.commands.registerCommand("stylusWorkspace.exportAbi", (project) => {
            (0, exportAbi_1.exportAbiHandler)(projectDataProvider, project, context);
        });
        let disposableCheck = vscode.commands.registerCommand("stylusWorkspace.check", (project) => {
            (0, check_1.checkHandler)(projectDataProvider, project, context);
        });
        let disposableDeploy = vscode.commands.registerCommand("stylusWorkspace.deploy", (project) => {
            (0, deploy_1.deployHandler)(projectDataProvider, project, context);
        });
        let disposableReplay = vscode.commands.registerCommand("stylusWorkspace.replay", (project) => {
            (0, replay_1.replayHandler)(projectDataProvider, project, context);
        });
        let disposableTrace = vscode.commands.registerCommand("stylusWorkspace.trace", (project) => {
            (0, trace_1.traceHandler)(projectDataProvider, project, context);
        });
        let disposableOpenFolder = vscode.commands.registerCommand("stylusWorkspace.openProject", (project) => {
            vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(project.path), false // This should be false for opening in the same window
            );
        });
        let disposableOpenProjectInNewWindow = vscode.commands.registerCommand("stylusWorkspace.openProjectInNewWindow", (project) => {
            vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(project.path), true // This should be true for opening in a new window
            );
        });
        let disposableRevealInFinder = vscode.commands.registerCommand("stylusWorkspace.revealInFinder", (project) => {
            vscode.env.openExternal(vscode.Uri.file(project.path));
        });
        let disposableAddToWorkspace = vscode.commands.registerCommand("stylusWorkspace.addToWorkspace", (project) => {
            const uri = vscode.Uri.file(project.path);
            vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders
                ? vscode.workspace.workspaceFolders.length
                : 0, null, { uri });
        });
        function handleEditorCommand(action) {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                const selectedText = activeEditor.document.getText(activeEditor.selection);
                if (selectedText) {
                    chatViewProvider.handleSelectedText(action, selectedText);
                }
                else {
                    vscode.window.showInformationMessage("No text selected.");
                }
            }
        }
        let disposableStylusGptExplain = vscode.commands.registerCommand("stylusGpt.explain", () => {
            handleEditorCommand("Explain");
        });
        let disposableStylusGptRefactor = vscode.commands.registerCommand("stylusGpt.refactor", () => {
            handleEditorCommand("Refactor");
        });
        let disposableStylusGptFindProblems = vscode.commands.registerCommand("stylusGpt.findProblems", () => {
            handleEditorCommand("FindProblems");
        });
        let disposableStylusJson = vscode.commands.registerCommand("stylusWorkspace.openStylusJson", async () => {
            const filePath = path.join(context.extensionPath, "src/data/cargoConfig.json");
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath)); // Use the file path
            vscode.window.showTextDocument(doc);
        });
        // Register the commands and subscriptions
        context.subscriptions.push(disposableCreateProject, disposableAddExistingProject, disposableOpenProject, disposableRemoveProjectFromView, disposableExportApi, disposableCheck, disposableDeploy, disposableReplay, disposableTrace, disposableOpenFolder, disposableOpenProjectInNewWindow, disposableRevealInFinder, disposableAddToWorkspace, disposableStylusGptExplain, disposableStylusGptRefactor, disposableStylusGptFindProblems, disposableStylusJson);
        // You can also update the context here, if needed
        vscode.commands.executeCommand("setContext", "stylusWorkspace.cargoStylusInstalled", true);
    })
        .catch((err) => {
        // Handle the error if cargo stylus is not installed
        console.error("Cargo Stylus is not installed: ", err);
        // You might want to set the context here as well to ensure the views are hidden
        vscode.commands.executeCommand("setContext", "stylusWorkspace.cargoStylusInstalled", false);
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map