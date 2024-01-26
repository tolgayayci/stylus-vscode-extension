import * as vscode from "vscode";
import { checkCargoStylus } from "../utils/checkCargoStylus";
import { checkIsStylusProject } from "../utils/checkIsStylusProject";
import { ProjectDataProvider } from "../dataProviders/ProjectDataProvider";

export function replayHandler(projectDataProvider: ProjectDataProvider) {
  checkCargoStylus()
    .then(() => {
      selectProjectFolderAndExecuteReplay(projectDataProvider);
    })
    .catch((err) => {
      vscode.window.showErrorMessage(
        `Cargo Stylus is not installed: ${err.message}`
      );
    });
}

function selectProjectFolderAndExecuteReplay(
  projectDataProvider: ProjectDataProvider
) {
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
    executeCargoStylusReplay(projectsArray[0].folderPath);
  } else {
    // Multiple projects, ask the user to choose
    vscode.window
      .showQuickPick(projectsArray, {
        placeHolder: "Select a Stylus project to check",
      })
      .then((selected) => {
        if (selected) {
          executeCargoStylusReplay(selected.folderPath);
        }
      });
  }
}

async function collectReplayOptionsAndExecute(folderPath: string) {
  let options = "";

  // Endpoint option
  const endpoint = await askForInput(
    "Enter RPC endpoint (leave blank for default)",
    "http://localhost:8545"
  );
  if (endpoint) options += ` --endpoint "${endpoint}"`;

  // Tx to replay
  const tx = await askForInput("Enter Tx to replay", "");
  if (!tx) {
    vscode.window.showErrorMessage("Transaction ID is required for replay.");
    return;
  }
  options += ` --tx "${tx}"`;

  // Project path
  const projectPath = await askForInput(
    "Enter project path (leave blank for default)",
    "."
  );
  if (projectPath) options += ` --project "${projectPath}"`;

  // Stable Rust flag
  const useStableRust = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Use Stable Rust?",
  });
  if (useStableRust) options += " --stable-rust";

  runCargoStylusReplay(folderPath, options);
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

function runCargoStylusReplay(folderPath: string, options: string) {
  const terminal = vscode.window.createTerminal(`Stylus Replay: ${folderPath}`);
  terminal.show();
  terminal.sendText(`cd "${folderPath}" && cargo stylus replay ${options}`);
}

function executeCargoStylusReplay(folderPath: string) {
  vscode.window
    .showQuickPick(["Yes", "No"], {
      placeHolder: "Do you want to add options?",
    })
    .then((answer) => {
      if (answer === "Yes") {
        collectReplayOptionsAndExecute(folderPath);
      } else {
        runCargoStylusReplay(folderPath, "");
      }
    });
}
