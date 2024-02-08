import * as vscode from "vscode";
import * as childProcess from "child_process";

export function cargoStylusInstalled(installed: boolean) {
  vscode.commands.executeCommand(
    "setContext",
    "stylusWorkspace.cargoStylusInstalled",
    installed
  );
}

export function checkCargoStylus() {
  return new Promise((resolve, reject) => {
    childProcess.exec("cargo stylus --version", (err, stdout, stderr) => {
      if (err) {
        // cargo stylus is not installed
        vscode.window
          .showErrorMessage(
            "cargo stylus package is not installed. Please install it to use this extension at full functionality.",
            "Install"
          )
          .then((selection) => {
            if (selection === "Install") {
              // Opens the URL for cargo stylus installation
              vscode.env.openExternal(
                vscode.Uri.parse("https://github.com/OffchainLabs/cargo-stylus")
              );
            }
          });
        cargoStylusInstalled(false);
        reject(err);
      } else {
        // cargo stylus is installed, continue activation
        cargoStylusInstalled(true);
        resolve(stdout);
      }
    });
  });
}
