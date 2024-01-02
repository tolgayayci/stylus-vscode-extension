import * as vscode from "vscode";
import { checkCargoStylus } from "./utils/checkCargoStylus";
import { createNewProjectHandler } from "./commands/createNewProject";
import { addExistingProjectHandler } from "./commands/addExistingProject";
import { removeProjectHandler } from "./commands/removeProject";

export function activate(context: vscode.ExtensionContext) {
  checkCargoStylus()
    .then(() => {
      // Command to create a new project
      let disposableCreateProject = vscode.commands.registerCommand(
        "stylusWorkspace.createProject",
        () => {
          createNewProjectHandler();
        }
      );

      // Command to add an existing project
      let disposableAddExistingProject = vscode.commands.registerCommand(
        "stylusWorkspace.addExistingProject",
        () => {
          addExistingProjectHandler();
        }
      );

      // Command to remove a project
      let disposableRemoveProject = vscode.commands.registerCommand(
        "stylusWorkspace.removeProject",
        () => {
          removeProjectHandler();
        }
      );

      // Register the commands and subscriptions
      context.subscriptions.push(
        disposableCreateProject,
        disposableAddExistingProject,
        disposableRemoveProject
      );

      // You can also update the context here, if needed
      vscode.commands.executeCommand(
        "setContext",
        "stylusWorkspace.cargoStylusInstalled",
        true
      );
    })
    .catch((err) => {
      // Handle the error if cargo stylus is not installed
      console.error("Cargo Stylus is not installed: ", err);

      // You might want to set the context here as well to ensure the views are hidden
      vscode.commands.executeCommand(
        "setContext",
        "stylusWorkspace.cargoStylusInstalled",
        false
      );

      // Optionally, you can provide additional UI or notifications here to inform the user
    });
}
