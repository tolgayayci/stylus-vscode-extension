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
exports.checkHandler = void 0;
const vscode = __importStar(require("vscode"));
const checkCargoStylus_1 = require("../utils/checkCargoStylus");
const checkIsStylusProject_1 = require("../utils/checkIsStylusProject");
function checkHandler(projectDataProvider, directProject) {
    (0, checkCargoStylus_1.checkCargoStylus)()
        .then(() => {
        selectProjectFolderAndExecuteCheck(projectDataProvider, directProject);
    })
        .catch((err) => {
        vscode.window.showErrorMessage(`Cargo Stylus is not installed: ${err.message}`);
    });
}
exports.checkHandler = checkHandler;
function selectProjectFolderAndExecuteCheck(projectDataProvider, directProject) {
    if (directProject) {
        // Directly execute check for the provided project
        executeCargoStylusCheck(directProject.path);
        return;
    }
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const projectDataProviderProjects = projectDataProvider.projects;
    if ((!workspaceFolders || workspaceFolders.length === 0) &&
        projectDataProviderProjects.length === 0) {
        vscode.window.showErrorMessage("No project folder, workspace, or registered projects are open.");
        return;
    }
    // Create a combined list of unique projects from workspace folders and ProjectDataProvider
    const combinedProjects = new Map();
    // Add workspace folders to the combined list
    workspaceFolders?.forEach((folder) => {
        if ((0, checkIsStylusProject_1.checkIsStylusProject)(folder.uri.fsPath)) {
            combinedProjects.set(folder.uri.fsPath, {
                label: folder.name,
                folderPath: folder.uri.fsPath,
            });
        }
    });
    // Add projects from ProjectDataProvider, mark with a badge
    projectDataProviderProjects.forEach((project) => {
        if ((0, checkIsStylusProject_1.checkIsStylusProject)(project.path)) {
            const existingProject = combinedProjects.get(project.path);
            if (existingProject) {
                // If the project is already in the list (from workspace folders), add a badge
                existingProject.description = "Registered Project";
            }
            else {
                // Add new project with badge
                combinedProjects.set(project.path, {
                    label: project.name,
                    folderPath: project.path,
                    description: "Registered Project",
                });
            }
        }
    });
    // Convert Map values to array for QuickPick
    const projectsArray = Array.from(combinedProjects.values());
    if (projectsArray.length === 0) {
        vscode.window.showErrorMessage("No Stylus projects found.");
        return;
    }
    if (projectsArray.length === 1) {
        // Only one project, use it directly
        executeCargoStylusCheck(projectsArray[0].folderPath);
    }
    else {
        // Multiple projects, ask the user to choose
        vscode.window
            .showQuickPick(projectsArray, {
            placeHolder: "Select a Stylus project to check",
        })
            .then((selected) => {
            if (selected) {
                executeCargoStylusCheck(selected.folderPath);
            }
        });
    }
}
async function collectOptionsAndExecute(folderPath) {
    let options = "";
    // Endpoint option
    const endpoint = await askForInput("Enter RPC endpoint of the Stylus node (leave blank for default)", "https://stylus-testnet.arbitrum.io/rpc");
    if (endpoint)
        options += ` --endpoint "${endpoint}"`;
    // WASM file path
    const wasmFilePath = await askForInput("Enter the WASM file path (leave blank if not applicable)");
    if (wasmFilePath)
        options += ` --wasm-file-path "${wasmFilePath}"`;
    // Expected program address
    const expectedProgramAddress = await askForInput("Enter the expected program address (leave blank for default)", "0x0000000000000000000000000000000000000000");
    if (expectedProgramAddress)
        options += ` --expected-program-address "${expectedProgramAddress}"`;
    // Private key path
    const privateKeyPath = await askForInput("Enter the private key path (leave blank if not applicable)");
    if (privateKeyPath)
        options += ` --private-key-path "${privateKeyPath}"`;
    // Private key
    const privateKey = await askForInput("Enter the private key (leave blank if not applicable)");
    if (privateKey)
        options += ` --private-key "${privateKey}"`;
    // Keystore path
    const keystorePath = await askForInput("Enter the keystore path (leave blank if not applicable)");
    if (keystorePath)
        options += ` --keystore-path "${keystorePath}"`;
    // Keystore password path
    const keystorePasswordPath = await askForInput("Enter the keystore password path (leave blank if not applicable)");
    if (keystorePasswordPath)
        options += ` --keystore-password-path "${keystorePasswordPath}"`;
    // Nightly flag
    const useNightly = await vscode.window.showQuickPick(["Yes", "No"], {
        placeHolder: "Use Rust nightly?",
    });
    if (useNightly === "Yes")
        options += " --nightly";
    runCargoStylusCheck(folderPath, options);
}
async function askForInput(prompt, defaultValue) {
    return vscode.window.showInputBox({
        prompt: prompt,
        value: defaultValue,
    });
}
function runCargoStylusCheck(folderPath, options) {
    const terminal = vscode.window.createTerminal(`Stylus Check: ${folderPath}`);
    terminal.show();
    terminal.sendText(`cd "${folderPath}" && cargo stylus check ${options}`);
}
function executeCargoStylusCheck(folderPath) {
    vscode.window
        .showQuickPick(["Yes", "No"], {
        placeHolder: "Do you want to add options?",
    })
        .then((answer) => {
        if (answer === "Yes") {
            collectOptionsAndExecute(folderPath);
        }
        else {
            runCargoStylusCheck(folderPath, "");
        }
    });
}
//# sourceMappingURL=check.js.map