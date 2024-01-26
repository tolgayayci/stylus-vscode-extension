import * as vscode from "vscode";
import { checkCargoStylus } from "../utils/checkCargoStylus";
import { checkIsStylusProject } from "../utils/checkIsStylusProject";
import { Project } from "../models/Project";
import { ProjectDataProvider } from "../dataProviders/ProjectDataProvider";

export function traceHandler(
  projectDataProvider: ProjectDataProvider,
  directProject?: Project
) {
  checkCargoStylus()
    .then(() => {
      selectProjectFolderAndExecuteTrace(projectDataProvider, directProject);
    })
    .catch((err) => {
      vscode.window.showErrorMessage(
        `Cargo Stylus is not installed: ${err.message}`
      );
    });
}

function selectProjectFolderAndExecuteTrace(
  projectDataProvider: ProjectDataProvider,
  directProject?: Project
) {
  if (directProject) {
    // Directly execute check for the provided project
    executeCargoStylusTrace(directProject.path);
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

  // Add workspace folders to the combined list
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
    executeCargoStylusTrace(projectsArray[0].folderPath);
  } else {
    // Multiple projects, ask the user to choose
    vscode.window
      .showQuickPick(projectsArray, {
        placeHolder: "Select a Stylus project to check",
      })
      .then((selected) => {
        if (selected) {
          executeCargoStylusTrace(selected.folderPath);
        }
      });
  }
}

async function collectTraceOptionsAndExecute(folderPath: string) {
  let options = "";

  // Endpoint option
  const endpoint = await askForInput(
    "Enter RPC endpoint (leave blank for default)",
    "http://localhost:8545"
  );
  if (endpoint) options += ` --endpoint "${endpoint}"`;

  // Tx to trace
  const tx = await askForInput("Enter Tx to trace", "");
  if (!tx) {
    vscode.window.showErrorMessage("Transaction ID is required for trace.");
    return;
  }
  options += ` --tx "${tx}"`;

  // Project path
  const projectPath = await askForInput(
    "Enter project path (leave blank for default)",
    "."
  );
  if (projectPath) options += ` --project "${projectPath}"`;

  runCargoStylusTrace(folderPath, options);
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

function runCargoStylusTrace(folderPath: string, options: string) {
  const terminal = vscode.window.createTerminal(`Stylus Trace: ${folderPath}`);
  terminal.show();
  terminal.sendText(`cd "${folderPath}" && cargo stylus trace ${options}`);
}

function executeCargoStylusTrace(folderPath: string) {
  vscode.window
    .showQuickPick(["Yes", "No"], {
      placeHolder: "Do you want to add options?",
    })
    .then((answer) => {
      if (answer === "Yes") {
        collectTraceOptionsAndExecute(folderPath);
      } else {
        runCargoStylusTrace(folderPath, "");
      }
    });
}
