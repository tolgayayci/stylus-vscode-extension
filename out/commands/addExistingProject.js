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
const fs = __importStar(require("fs"));
function addExistingProjectHandler() {
    vscode.window
        .showOpenDialog({ canSelectFolders: true, canSelectMany: false })
        .then((folderUri) => {
        if (folderUri && folderUri[0]) {
            const folderPath = folderUri[0].fsPath;
            // Check if it's a Stylus project (e.g., look for specific files)
            if (fs.existsSync(`${folderPath}/some_stylus_indicator.file`)) {
                // Add logic to add project to the view
            }
            else {
                vscode.window.showErrorMessage("Selected directory is not a Stylus project.");
            }
        }
    });
}
exports.addExistingProjectHandler = addExistingProjectHandler;
//# sourceMappingURL=addExistingProject.js.map