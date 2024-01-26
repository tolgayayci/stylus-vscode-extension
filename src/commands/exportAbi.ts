import * as vscode from "vscode";
import { checkCargoStylus } from "../utils/checkCargoStylus";
import { checkIsStylusProject } from "../utils/checkIsStylusProject";
import { ProjectDataProvider } from "../dataProviders/ProjectDataProvider";

export function exportAbiHandler(projectDataProvider: ProjectDataProvider) {
  checkCargoStylus()
    .then(() => {
      selectProjectFolderAndExecuteExportAbi(projectDataProvider);
    })
    .catch((err) => {
      vscode.window.showErrorMessage(
        `Cargo Stylus is not installed: ${err.message}`
      );
    });
}

function selectProjectFolderAndExecuteExportAbi(
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
    executeCargoStylusExportAbi(projectsArray[0].folderPath);
  } else {
    // Multiple projects, ask the user to choose
    vscode.window
      .showQuickPick(projectsArray, {
        placeHolder: "Select a Stylus project to check",
      })
      .then((selected) => {
        if (selected) {
          executeCargoStylusExportAbi(selected.folderPath);
        }
      });
  }
}

async function collectExportAbiOptionsAndExecute(folderPath: string) {
  let options = "";

  // Release option
  const useRelease = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Build in release mode?",
  });
  if (useRelease === "Yes") options += " --release";

  // Output file
  const outputFile = await askForInput(
    "Enter the output file path (leave blank for stdout)"
  );
  if (outputFile) options += ` --output "${outputFile}"`;

  // JSON option
  const useJson = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Output a JSON ABI using solc?",
  });
  if (useJson === "Yes") options += " --json";

  runCargoStylusExportAbi(folderPath, options);
}

function runCargoStylusExportAbi(folderPath: string, options: string) {
  const terminal = vscode.window.createTerminal(
    `Stylus: Export ABI: ${folderPath}`
  );
  terminal.show();
  terminal.sendText(`cd "${folderPath}" && cargo stylus export-abi ${options}`);
}

function executeCargoStylusExportAbi(folderPath: string) {
  vscode.window
    .showQuickPick(["Yes", "No"], {
      placeHolder: "Do you want to add options?",
    })
    .then((answer) => {
      if (answer === "Yes") {
        collectExportAbiOptionsAndExecute(folderPath);
      } else {
        runCargoStylusExportAbi(folderPath, "");
      }
    });
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
