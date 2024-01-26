import * as vscode from "vscode";

//Commands
import { createNewProjectHandler } from "./commands/createNewProject";
import { addExistingProjectHandler } from "./commands/addExistingProject";
import { exportAbiHandler } from "./commands/exportAbi";
import { checkHandler } from "./commands/check";
import { deployHandler } from "./commands/deploy";
import { replayHandler } from "./commands/replay";
import { traceHandler } from "./commands/trace";

//Data Providers
import { ProjectDataProvider } from "./dataProviders/ProjectDataProvider";

//Utils
import { checkCargoStylus } from "./utils/checkCargoStylus";

export function activate(context: vscode.ExtensionContext) {
  //Data Provider for the project view
  const projectDataProvider = new ProjectDataProvider();
  vscode.window.registerTreeDataProvider("projectView", projectDataProvider);

  checkCargoStylus()
    .then(() => {
      // Command to create a new project
      let disposableCreateProject = vscode.commands.registerCommand(
        "stylusWorkspace.createNewProject",
        () => {
          createNewProjectHandler(projectDataProvider);
        }
      );

      // Command to add an existing project
      let disposableAddExistingProject = vscode.commands.registerCommand(
        "stylusWorkspace.addExistingProject",
        () => {
          addExistingProjectHandler(projectDataProvider);
        }
      );

      let disposableOpenProject = vscode.commands.registerCommand(
        "stylusWorkspace.openProjectFolder",
        (projectPath) => {
          vscode.commands.executeCommand(
            "vscode.openFolder",
            vscode.Uri.file(projectPath),
            true
          );
        }
      );

      let disposableRemoveProjectFromView = vscode.commands.registerCommand(
        "stylusWorkspace.removeProjectFromView",
        (project) => {
          if (project && project.path) {
            projectDataProvider.removeProject(project.path);
          }
        }
      );

      let disposableExportApi = vscode.commands.registerCommand(
        "stylusWorkspace.exportAbi",
        () => {
          exportAbiHandler(projectDataProvider);
        }
      );

      let disposableCheck = vscode.commands.registerCommand(
        "stylusWorkspace.check",
        () => {
          checkHandler(projectDataProvider);
        }
      );

      let disposableDeploy = vscode.commands.registerCommand(
        "stylusWorkspace.deploy",
        () => {
          deployHandler(projectDataProvider);
        }
      );

      let disposableReplay = vscode.commands.registerCommand(
        "stylusWorkspace.replay",
        () => {
          replayHandler(projectDataProvider);
        }
      );

      let disposableTrace = vscode.commands.registerCommand(
        "stylusWorkspace.trace",
        () => {
          traceHandler(projectDataProvider);
        }
      );

      // Register the commands and subscriptions
      context.subscriptions.push(
        disposableCreateProject,
        disposableAddExistingProject,
        disposableOpenProject,
        disposableRemoveProjectFromView,
        disposableExportApi,
        disposableCheck,
        disposableDeploy,
        disposableReplay,
        disposableTrace
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
