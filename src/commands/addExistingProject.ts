import * as vscode from "vscode";
import * as fs from "fs";

export function addExistingProjectHandler() {
  vscode.window
    .showOpenDialog({ canSelectFolders: true, canSelectMany: false })
    .then((folderUri) => {
      if (folderUri && folderUri[0]) {
        const folderPath = folderUri[0].fsPath;

        // Check if it's a Stylus project (e.g., look for specific files)
        if (fs.existsSync(`${folderPath}/some_stylus_indicator.file`)) {
          // Add logic to add project to the view
        } else {
          vscode.window.showErrorMessage(
            "Selected directory is not a Stylus project."
          );
        }
      }
    });
}
