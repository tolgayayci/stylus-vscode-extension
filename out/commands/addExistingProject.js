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
exports.addExistingProjectHandler = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const Project_1 = require("../models/Project"); // Ensure that Project is properly imported
const checkIsStylusProject_1 = require("../utils/checkIsStylusProject");
function addExistingProjectHandler(projectDataProvider) {
    vscode.window
        .showOpenDialog({ canSelectFolders: true, canSelectMany: false })
        .then((folderUri) => {
        if (folderUri && folderUri[0]) {
            const projectPath = folderUri[0].fsPath;
            const projectName = path.basename(projectPath);
            if ((0, checkIsStylusProject_1.checkIsStylusProject)(projectPath)) {
                projectDataProvider.addProject(new Project_1.Project(projectName, projectPath, new Date()));
            }
            else {
                vscode.window.showErrorMessage("Selected directory does not contain a valid Stylus project.");
            }
        }
    });
}
exports.addExistingProjectHandler = addExistingProjectHandler;
//# sourceMappingURL=addExistingProject.js.map