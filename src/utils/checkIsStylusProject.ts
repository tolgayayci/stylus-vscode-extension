import * as fs from "fs";
import * as path from "path";
import { parse as parseToml } from "toml";

export function checkIsStylusProject(projectPath: string): boolean {
  const cargoFilePath = path.join(projectPath, "Cargo.toml");

  if (fs.existsSync(cargoFilePath)) {
    try {
      const cargoFileContent = fs.readFileSync(cargoFilePath, "utf8");
      const cargoToml = parseToml(cargoFileContent);

      return !!(cargoToml.dependencies && cargoToml.dependencies["stylus-sdk"]);
    } catch (error) {
      console.error("Error parsing Cargo.toml: ", error);
      return false;
    }
  }
  return false;
}
