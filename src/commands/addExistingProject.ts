import * as vscode from "vscode";
import * as path from "path";
import { ProjectDataProvider } from "../dataProviders/ProjectDataProvider";
import { Project } from "../models/Project"; // Ensure that Project is properly imported
import { checkIsStylusProject } from "../utils/checkIsStylusProject";

export function addExistingProjectHandler(
  projectDataProvider: ProjectDataProvider
) {
  vscode.window
    .showOpenDialog({ canSelectFolders: true, canSelectMany: false })
    .then((folderUri) => {
      if (folderUri && folderUri[0]) {
        const projectPath = folderUri[0].fsPath;
        const projectName = path.basename(projectPath);

        if (checkIsStylusProject(projectPath)) {
          projectDataProvider.addProject(
            new Project(projectName, projectPath, new Date())
          );
        } else {
          vscode.window.showErrorMessage(
            "Selected directory does not contain a valid Stylus project."
          );
        }
      }
    });
}
