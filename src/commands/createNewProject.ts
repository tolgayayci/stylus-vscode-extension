import * as vscode from "vscode";
import * as childProcess from "child_process";
import { checkCargoStylus } from "../utils/checkCargoStylus";

export function createNewProjectHandler() {
  checkCargoStylus()
    .then(() => {
      vscode.window
        .showInputBox({ prompt: "Enter Project Name" })
        .then((projectName) => {
          if (projectName) {
            childProcess.exec(
              `cargo stylus new ${projectName}`,
              (err, stdout, stderr) => {
                if (err) {
                  vscode.window.showErrorMessage("Failed to create project");
                } else {
                  // Add logic to add the new project to the view
                  vscode.window.showInformationMessage(
                    `Project ${projectName} created`
                  );
                }
              }
            );
          }
        });
    })
    .catch((err) => {
      vscode.window.showErrorMessage("Cargo Stylus is not installed.");
    });
}
