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
exports.deployHandler = void 0;
const vscode = __importStar(require("vscode"));
const checkCargoStylus_1 = require("../utils/checkCargoStylus");
const checkIsStylusProject_1 = require("../utils/checkIsStylusProject");
function deployHandler(projectDataProvider, directProject) {
    (0, checkCargoStylus_1.checkCargoStylus)()
        .then(() => {
        selectProjectFolderAndExecuteDeploy(projectDataProvider, directProject);
    })
        .catch((err) => {
        vscode.window.showErrorMessage(`Cargo Stylus is not installed: ${err.message}`);
    });
}
exports.deployHandler = deployHandler;
function selectProjectFolderAndExecuteDeploy(projectDataProvider, directProject) {
    if (directProject) {
        // Directly execute check for the provided project
        executeCargoStylusDeploy(directProject.path);
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
        executeCargoStylusDeploy(projectsArray[0].folderPath);
    }
    else {
        // Multiple projects, ask the user to choose
        vscode.window
            .showQuickPick(projectsArray, {
            placeHolder: "Select a Stylus project to check",
        })
            .then((selected) => {
            if (selected) {
                executeCargoStylusDeploy(selected.folderPath);
            }
        });
    }
}
async function collectDeployOptionsAndExecute(folderPath) {
    let options = "";
    // Collecting options...
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
    const useNightly = await askForQuickPick("Use Rust nightly?");
    // Estimate gas only flag
    const estimateGasOnly = await askForQuickPick("Estimate deployment gas costs?");
    if (estimateGasOnly)
        options += " --estimate-gas-only";
    // Mode
    const mode = await askForInput("Enter mode (deploy-only/activate-only, leave blank for default)");
    if (mode)
        options += ` --mode "${mode}"`;
    // Activate program address
    const activateProgramAddress = await askForInput("Enter the address of the program to activate (leave blank if not applicable)");
    if (activateProgramAddress)
        options += ` --activate-program-address "${activateProgramAddress}"`;
    // Dry run flag
    const dryRun = await askForQuickPick("Prepare transactions but do not send (dry run)?");
    if (dryRun)
        options += " --dry-run";
    // Output transaction data directory
    const outputTxDataDir = await askForInput("Enter the directory to output transaction data (leave blank if not applicable)");
    if (outputTxDataDir)
        options += ` --output-tx-data-to-dir "${outputTxDataDir}"`;
    runCargoStylusDeploy(folderPath, options);
}
async function askForInput(prompt, defaultValue) {
    return vscode.window.showInputBox({
        prompt: prompt,
        value: defaultValue,
    });
}
async function askForQuickPick(prompt) {
    const response = await vscode.window.showQuickPick(["Yes", "No"], {
        placeHolder: prompt,
    });
    return response === "Yes";
}
function runCargoStylusDeploy(folderPath, options) {
    const terminal = vscode.window.createTerminal(`Stylus Deploy: ${folderPath}`);
    terminal.show();
    terminal.sendText(`cd "${folderPath}" && cargo stylus deploy ${options}`);
}
function executeCargoStylusDeploy(folderPath) {
    vscode.window
        .showQuickPick(["Yes", "No"], {
        placeHolder: "Do you want to add options?",
    })
        .then((answer) => {
        if (answer === "Yes") {
            collectDeployOptionsAndExecute(folderPath);
        }
        else {
            runCargoStylusDeploy(folderPath, "");
        }
    });
}
//# sourceMappingURL=deploy.js.map