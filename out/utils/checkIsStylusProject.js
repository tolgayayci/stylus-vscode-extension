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
exports.checkIsStylusProject = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const toml_1 = require("toml");
function checkIsStylusProject(projectPath) {
    const cargoFilePath = path.join(projectPath, "Cargo.toml");
    if (fs.existsSync(cargoFilePath)) {
        try {
            const cargoFileContent = fs.readFileSync(cargoFilePath, "utf8");
            const cargoToml = (0, toml_1.parse)(cargoFileContent);
            return !!(cargoToml.dependencies && cargoToml.dependencies["stylus-sdk"]);
        }
        catch (error) {
            console.error("Error parsing Cargo.toml: ", error);
            return false;
        }
    }
    return false;
}
exports.checkIsStylusProject = checkIsStylusProject;
//# sourceMappingURL=checkIsStylusProject.js.map