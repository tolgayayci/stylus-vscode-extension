"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCargoStylus = exports.cargoStylusInstalled = void 0;
const vscode = __importStar(require("vscode"));
const childProcess = __importStar(require("child_process"));
function cargoStylusInstalled(installed) {
    vscode.commands.executeCommand("setContext", "stylusWorkspace.cargoStylusInstalled", installed);
}
exports.cargoStylusInstalled = cargoStylusInstalled;
function checkCargoStylus() {
    return new Promise((resolve, reject) => {
        childProcess.exec("cargo stylus --version", (err, stdout, stderr) => {
            if (err) {
                // cargo stylus is not installed
                vscode.window
                    .showErrorMessage("cargo stylus package is not installed. Please install it to use this extension at full functionality.", "Install")
                    .then((selection) => {
                    if (selection === "Install") {
                        // Opens the URL for cargo stylus installation
                        vscode.env.openExternal(vscode.Uri.parse("https://github.com/OffchainLabs/cargo-stylus"));
                    }
                });
                cargoStylusInstalled(false);
                reject(err);
            }
            else {
                // cargo stylus is installed, continue activation
                cargoStylusInstalled(true);
                resolve(stdout);
            }
        });
    });
}
exports.checkCargoStylus = checkCargoStylus;
//# sourceMappingURL=checkCargoStylus.js.map