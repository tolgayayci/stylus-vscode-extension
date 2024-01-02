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
const checkCargoStylus_1 = require("./utils/checkCargoStylus");
const createNewProject_1 = require("./commands/createNewProject");
const addExistingProject_1 = require("./commands/addExistingProject");
const removeProject_1 = require("./commands/removeProject");
function activate(context) {
    (0, checkCargoStylus_1.checkCargoStylus)()
        .then(() => {
        // Command to create a new project
        let disposableCreateProject = vscode.commands.registerCommand("stylusWorkspace.createProject", () => {
            (0, createNewProject_1.createNewProjectHandler)();
        });
        // Command to add an existing project
        let disposableAddExistingProject = vscode.commands.registerCommand("stylusWorkspace.addExistingProject", () => {
            (0, addExistingProject_1.addExistingProjectHandler)();
        });
        // Command to remove a project
        let disposableRemoveProject = vscode.commands.registerCommand("stylusWorkspace.removeProject", () => {
            (0, removeProject_1.removeProjectHandler)();
        });
        // Register the commands and subscriptions
        context.subscriptions.push(disposableCreateProject, disposableAddExistingProject, disposableRemoveProject);
        // You can also update the context here, if needed
        vscode.commands.executeCommand("setContext", "stylusWorkspace.cargoStylusInstalled", true);
    })
        .catch((err) => {
        // Handle the error if cargo stylus is not installed
        console.error("Cargo Stylus is not installed: ", err);
        // You might want to set the context here as well to ensure the views are hidden
        vscode.commands.executeCommand("setContext", "stylusWorkspace.cargoStylusInstalled", false);
        // Optionally, you can provide additional UI or notifications here to inform the user
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map