import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { parse as parseToml } from "toml";
import { ProjectDataProvider } from "../dataProviders/ProjectDataProvider";
import { Project } from "../models/Project"; // Ensure that Project is properly imported

export function addExistingProjectHandler(
  projectDataProvider: ProjectDataProvider
) {
  vscode.window
    .showOpenDialog({ canSelectFolders: true, canSelectMany: false })
    .then((folderUri) => {
      if (folderUri && folderUri[0]) {
        const projectPath = folderUri[0].fsPath;
        const projectName = path.basename(projectPath); // Extracts the folder name
        const cargoFilePath = `${projectPath}/Cargo.toml`; // Corrected variable name

        // Check if Cargo.toml exists in the directory
        if (fs.existsSync(cargoFilePath)) {
          const cargoFileContent = fs.readFileSync(cargoFilePath, "utf8");
          try {
            const cargoToml = parseToml(cargoFileContent);

            // Check if 'stylus-sdk' dependency exists
            if (
              cargoToml.dependencies &&
              cargoToml.dependencies["stylus-sdk"]
            ) {
              projectDataProvider.addProject(
                new Project(projectName, projectPath, new Date())
              );
            } else {
              vscode.window.showErrorMessage(
                "Selected directory does not contain a valid Stylus project. This may be because 'stylus-sdk' dependency is missing in Cargo.toml. Make sure you selected root folder of the Stylus project!"
              );
            }
          } catch (error) {
            vscode.window.showErrorMessage(
              "Error parsing Cargo.toml: " + error
            );
          }
        } else {
          vscode.window.showErrorMessage(
            "Selected directory does not contain a valid Stylus project. Make sure you selected root folder of the Stylus project!"
          );
        }
      }
    });
}
