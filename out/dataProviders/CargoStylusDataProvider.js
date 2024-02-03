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
exports.OptionItem = exports.CargoStylusDataProvider = void 0;
const vscode = __importStar(require("vscode"));
class CargoStylusDataProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            // If the element has children, return them
            return Promise.resolve(element.children);
        }
        else {
            // Return the root level items (options for Cargo Stylus)
            return Promise.resolve(this.getRootOptions());
        }
    }
    getRootOptions() {
        // This would be your options like "Check", "Deploy", etc.
        return [
            new OptionItem("Check", "check", []),
            new OptionItem("Deploy", "deploy", []),
            // Add other options as necessary
        ];
    }
}
exports.CargoStylusDataProvider = CargoStylusDataProvider;
class OptionItem extends vscode.TreeItem {
    label;
    commandId;
    children;
    constructor(label, commandId, children) {
        super(label, children.length === 0
            ? vscode.TreeItemCollapsibleState.None
            : vscode.TreeItemCollapsibleState.Collapsed);
        this.label = label;
        this.commandId = commandId;
        this.children = children;
        this.command = { command: commandId, title: label, arguments: [this] };
    }
}
exports.OptionItem = OptionItem;
//# sourceMappingURL=CargoStylusDataProvider.js.map