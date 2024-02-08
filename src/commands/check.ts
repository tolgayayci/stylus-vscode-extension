import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

import { checkCargoStylus } from "../utils/checkCargoStylus";
import { checkIsStylusProject } from "../utils/checkIsStylusProject";
import { ProjectDataProvider } from "../dataProviders/ProjectDataProvider";
import { Project, CommandOptions } from "../models/Project";
import * as config from "../data/cargoConfig.json";

export function checkHandler(
  projectDataProvider: ProjectDataProvider,
  directProject?: Project,
  context?: vscode.ExtensionContext
) {
  checkCargoStylus()
    .then(() => {
      const commandOptions = loadCommandOptions(
        context as vscode.ExtensionContext,
        "check"
      );
      selectProjectFolderAndExecuteCheck(
        projectDataProvider,
        commandOptions,
        directProject
      );
    })
    .catch((err) => {
      vscode.window.showErrorMessage(
        `Cargo Stylus is not installed or unknown error occured: ${err.message}`
      );
    });
}

function selectProjectFolderAndExecuteCheck(
  projectDataProvider: ProjectDataProvider,
  commandOptions: CommandOptions,
  directProject?: Project
) {
  if (directProject) {
    // Directly execute check for the provided project
    executeCargoStylusCheck(directProject.path, commandOptions);
    return;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  const projectDataProviderProjects = projectDataProvider.projects;

  if (
    (!workspaceFolders || workspaceFolders.length === 0) &&
    projectDataProviderProjects.length === 0
  ) {
    vscode.window.showErrorMessage(
      "No project folder, workspace, or registered projects are open."
    );
    return;
  }

  // Create a combined list of unique projects from workspace folders and ProjectDataProvider
  const combinedProjects = new Map<
    string,
    { label: string; folderPath: string; description?: string }
  >();

  workspaceFolders?.forEach((folder) => {
    if (checkIsStylusProject(folder.uri.fsPath)) {
      combinedProjects.set(folder.uri.fsPath, {
        label: folder.name,
        folderPath: folder.uri.fsPath,
      });
    }
  });

  // Add projects from ProjectDataProvider, mark with a badge
  projectDataProviderProjects.forEach((project) => {
    if (checkIsStylusProject(project.path)) {
      const existingProject = combinedProjects.get(project.path);
      if (existingProject) {
        // If the project is already in the list (from workspace folders), add a badge
        existingProject.description = "Registered Project";
      } else {
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
    executeCargoStylusCheck(projectsArray[0].folderPath, commandOptions);
  } else {
    // Multiple projects, ask the user to choose
    vscode.window
      .showQuickPick(projectsArray, {
        placeHolder: "Select a Stylus project to check",
      })
      .then((selected) => {
        if (selected) {
          executeCargoStylusCheck(selected.folderPath, commandOptions);
        }
      });
  }
}

async function collectOptionsAndExecute(
  folderPath: string,
  commandOptions: CommandOptions
) {
  let options = "";

  for (const [optionKey, optionValue] of Object.entries(commandOptions)) {
    // Handle boolean options with a QuickPick
    if (typeof optionValue.default === "boolean") {
      if (optionValue.default) {
        options += ` ${optionKey}`;
      } else {
        const enableFlag = await vscode.window.showQuickPick(["Yes", "No"], {
          placeHolder: `Enable ${optionKey}? (${optionValue.description})`,
        });
        if (enableFlag === "Yes") {
          options += ` ${optionKey}`;
        } else if (enableFlag === undefined) {
          // Cancellation
          return; // Exit the function early
        }
      }
    } else if (optionValue.default !== null) {
      const userValue = await askForInput(
        optionValue.description,
        optionValue.default.toString()
      );
      if (userValue !== undefined) {
        // Ensure it's not a cancellation
        options += ` ${optionKey} "${userValue}"`;
      } else {
        return; // User cancelled the input
      }
    } else {
      console.warn(
        `Option "${optionKey}" has no default value, and is not handled.`
      );
    }
  }

  runCargoStylusCheck(folderPath, options);
}

async function askForInput(
  prompt: string,
  defaultValue?: string
): Promise<string | undefined> {
  return vscode.window.showInputBox({
    prompt: prompt,
    value: defaultValue,
  });
}

function loadCommandOptions(
  context: vscode.ExtensionContext,
  commandName: string
): CommandOptions {
  // Construct the file path using the extension context's extensionPath
  const filePath = path.join(
    context.extensionPath,
    "src/data/cargoConfig.json"
  );

  try {
    const rawData = fs.readFileSync(filePath);
    const config = JSON.parse(rawData.toString());
    // Dynamically select the command options based on the commandName parameter
    const commandConfig = config[commandName];
    if (!commandConfig || !commandConfig.options) {
      throw new Error(`Command options for '${commandName}' not found.`);
    }
    return commandConfig.options;
  } catch (error) {
    console.error("Error loading command options:", error);
    throw new Error(
      `Failed to load command options for '${commandName}': ${error}`
    );
  }
}

function runCargoStylusCheck(folderPath: string, options: string) {
  const terminal = vscode.window.createTerminal(`Stylus Check: ${folderPath}`);
  terminal.show();
  terminal.sendText(`cd "${folderPath}" && cargo stylus check ${options}`);
}

function executeCargoStylusCheck(
  folderPath: string,
  commandOptions: CommandOptions
) {
  vscode.window
    .showQuickPick(["Yes", "No"], {
      placeHolder: "Do you want to add options?",
    })
    .then((answer) => {
      if (answer === "Yes") {
        collectOptionsAndExecute(folderPath, commandOptions);
      } else if (answer === "No") {
        runCargoStylusCheck(folderPath, "");
      }
      // If answer is undefined (Esc was pressed), do nothing
    });
}
