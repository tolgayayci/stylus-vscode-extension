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
exports.traceHandler = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const checkCargoStylus_1 = require("../utils/checkCargoStylus");
const checkIsStylusProject_1 = require("../utils/checkIsStylusProject");
function traceHandler(projectDataProvider, directProject, context) {
    (0, checkCargoStylus_1.checkCargoStylus)()
        .then(() => {
        const commandOptions = loadCommandOptions(context, "trace");
        selectProjectFolderAndExecuteTrace(projectDataProvider, commandOptions, directProject);
    })
        .catch((err) => {
        vscode.window.showErrorMessage(`Cargo Stylus is not installed or unknown error occured: ${err.message}`);
    });
}
exports.traceHandler = traceHandler;
function selectProjectFolderAndExecuteTrace(projectDataProvider, commandOptions, directProject) {
    if (directProject) {
        // Directly execute check for the provided project
        executeCargoStylusTrace(directProject.path, commandOptions);
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
        executeCargoStylusTrace(projectsArray[0].folderPath, commandOptions);
    }
    else {
        // Multiple projects, ask the user to choose
        vscode.window
            .showQuickPick(projectsArray, {
            placeHolder: "Select a Stylus project to check",
        })
            .then((selected) => {
            if (selected) {
                executeCargoStylusTrace(selected.folderPath, commandOptions);
            }
        });
    }
}
async function collectTraceOptionsAndExecute(folderPath, commandOptions) {
    let options = "";
    for (const [optionKey, optionValue] of Object.entries(commandOptions)) {
        // Handle boolean options with a QuickPick
        if (typeof optionValue.default === "boolean") {
            if (optionValue.default) {
                options += ` ${optionKey}`;
            }
            else {
                const enableFlag = await vscode.window.showQuickPick(["Yes", "No"], {
                    placeHolder: `Enable ${optionKey}? (${optionValue.description})`,
                });
                if (enableFlag === "Yes") {
                    options += ` ${optionKey}`;
                }
                else if (enableFlag === undefined) {
                    // Cancellation
                    return; // Exit the function early
                }
            }
        }
        else if (optionValue.default !== null) {
            const userValue = await askForInput(optionValue.description, optionValue.default.toString());
            if (userValue !== undefined) {
                // Ensure it's not a cancellation
                options += ` ${optionKey} "${userValue}"`;
            }
            else {
                return; // User cancelled the input
            }
        }
        else {
            console.warn(`Option "${optionKey}" has no default value, and is not handled.`);
        }
    }
    runCargoStylusTrace(folderPath, options);
}
async function askForInput(prompt, defaultValue) {
    return vscode.window.showInputBox({
        prompt: prompt,
        value: defaultValue,
    });
}
function loadCommandOptions(context, commandName) {
    // Construct the file path using the extension context's extensionPath
    const filePath = path.join(context.extensionPath, "src/data/cargoConfig.json");
    try {
        const rawData = fs.readFileSync(filePath);
        const config = JSON.parse(rawData.toString());
        // Dynamically select the command options based on the commandName parameter
        const commandConfig = config[commandName];
        if (!commandConfig || !commandConfig.options) {
            throw new Error(`Command options for '${commandName}' not found.`);
        }
        return commandConfig.options;
    }
    catch (error) {
        console.error("Error loading command options:", error);
        throw new Error(`Failed to load command options for '${commandName}': ${error}`);
    }
}
function runCargoStylusTrace(folderPath, options) {
    const terminal = vscode.window.createTerminal(`Stylus Trace: ${folderPath}`);
    terminal.show();
    terminal.sendText(`cd "${folderPath}" && cargo stylus trace ${options}`);
}
function executeCargoStylusTrace(folderPath, commandOptions) {
    vscode.window
        .showQuickPick(["Yes", "No"], {
        placeHolder: "Do you want to add options?",
    })
        .then((answer) => {
        if (answer === "Yes") {
            collectTraceOptionsAndExecute(folderPath, commandOptions);
        }
        else if (answer === "No") {
            runCargoStylusTrace(folderPath, "");
        }
        // If answer is undefined (Esc was pressed), do nothing
    });
}
//# sourceMappingURL=trace.js.map