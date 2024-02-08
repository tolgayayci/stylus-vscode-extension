import * as vscode from "vscode";
import * as childProcess from "child_process";

import { checkCargoStylus } from "../utils/checkCargoStylus";
import { Project } from "../models/Project";
import { ProjectDataProvider } from "../dataProviders/ProjectDataProvider";

export function createNewProjectHandler(
  projectDataProvider: ProjectDataProvider
) {
  checkCargoStylus()
    .then(() => {
      vscode.window
        .showInputBox({ prompt: "Enter Project Name" })
        .then((projectName) => {
          if (projectName) {
            vscode.window
              .showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                openLabel: "Select Project Folder",
              })
              .then((folderUri) => {
                if (folderUri && folderUri.length > 0) {
                  const projectPath = folderUri[0].fsPath;

                  // Display progress notification
                  vscode.window.withProgress(
                    {
                      location: vscode.ProgressLocation.Notification,
                      title: `Creating project "${projectName}"...`,
                      cancellable: false,
                    },
                    () => {
                      return new Promise<void>((resolve, reject) => {
                        childProcess.exec(
                          `cargo stylus new ${projectName}`,
                          { cwd: projectPath },
                          (err, stdout, stderr) => {
                            if (err) {
                              vscode.window.showErrorMessage(
                                `Failed to create project: ${err.message}`
                              );
                              reject();
                            } else {
                              projectDataProvider.addProject(
                                new Project(
                                  projectName,
                                  projectPath + "/" + projectName,
                                  new Date()
                                )
                              );
                              vscode.window.showInformationMessage(
                                `Project "${projectName}" created at ${projectPath}`
                              );
                              resolve();
                            }
                          }
                        );
                      });
                    }
                  );
                }
              });
          }
        });
    })
    .catch((err) => {
      vscode.window.showErrorMessage(
        `Cargo Stylus is not installed: ${err.message}`
      );
    });
}
