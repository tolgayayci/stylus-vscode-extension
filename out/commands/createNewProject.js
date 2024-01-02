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
exports.createNewProjectHandler = void 0;
const vscode = __importStar(require("vscode"));
const childProcess = __importStar(require("child_process"));
const checkCargoStylus_1 = require("../utils/checkCargoStylus");
function createNewProjectHandler() {
    (0, checkCargoStylus_1.checkCargoStylus)()
        .then(() => {
        vscode.window
            .showInputBox({ prompt: "Enter Project Name" })
            .then((projectName) => {
            if (projectName) {
                childProcess.exec(`cargo stylus new ${projectName}`, (err, stdout, stderr) => {
                    if (err) {
                        vscode.window.showErrorMessage("Failed to create project");
                    }
                    else {
                        // Add logic to add the new project to the view
                        vscode.window.showInformationMessage(`Project ${projectName} created`);
                    }
                });
            }
        });
    })
        .catch((err) => {
        vscode.window.showErrorMessage("Cargo Stylus is not installed.");
    });
}
exports.createNewProjectHandler = createNewProjectHandler;
//# sourceMappingURL=createNewProject.js.map