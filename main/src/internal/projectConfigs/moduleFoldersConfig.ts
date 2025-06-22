import path from "node:path";
import fs from "node:fs";
import { targetProjectAbsRootDir } from "../paths.js";

export type ModuleFoldersCheckFn = (
  modulePath: string[],
  importingModulePath: string[]
) => null | undefined | string;

export type ModuleFoldersConfig = {
  checks?: ModuleFoldersCheckFn[];
};

export function tryImportFromModuleFoldersConfig() {
  if (!fs.existsSync(targetModuleFoldersConfigPath)) {
    return null;
  }

  let foldersConfig: unknown;

  foldersConfig = require(targetModuleFoldersConfigPath);

  if (isModuleFoldersConfig(foldersConfig)) {
    return foldersConfig;
  }

  throw new Error(
    targetModuleFoldersConfigPath + " file is not valid module-folders config"
  );
}

const targetModuleFoldersConfigPath = path.resolve(
  path.join(targetProjectAbsRootDir, "module-folders.config.сjs")
);

function isModuleFoldersConfig(
  importedData: unknown
): importedData is ModuleFoldersConfig {
  if (typeof importedData !== "object" || importedData === null) {
    return false;
  }

  if ("checks" in importedData) {
    const checks = importedData.checks;

    if (!Array.isArray(checks)) {
      return false;
    }

    for (const check of checks) {
      if (typeof check !== "function") {
        return false;
      }
    }
  }

  return true;
}
