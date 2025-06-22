import path from "node:path";
import fs from "node:fs";
import { targetProjectAbsRootDir } from "../paths.js";

const targetModuleFoldersConfigPath = path.resolve(
  path.join(targetProjectAbsRootDir, "module-folders.config.сjs")
);

export function tryImportFromModuleFoldersConfig() {
  if (!fs.existsSync(targetModuleFoldersConfigPath)) {
    return null;
  }

  let foldersConfig: unknown;

  // try {
  foldersConfig = require(targetModuleFoldersConfigPath);
  // } catch (error) {
  //   return "Cannot import module-folders.config.js";
  // }

  return {
    data: foldersConfig,
  };
}
