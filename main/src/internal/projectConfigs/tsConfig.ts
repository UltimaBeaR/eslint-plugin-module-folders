import ts from "typescript";
import path from "node:path";
import { targetProjectAbsRootDir } from "../paths.js";

function parseTsConfig(tsconfigPath: string) {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  return ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath)
  );
}

// TODO: сделать нормальный поиск tsconfig / jsconfig, пока тут хардкод - просто в корне проекта tsconfig
// Либо сделать такой хардкод и возможность через настройки плагина задавать путь к этому конфигу

const targetTsConfigPath = path.resolve(
  path.join(targetProjectAbsRootDir, "tsconfig.json")
);
if (!targetTsConfigPath) {
  throw new Error("tsconfig.json not found");
}

export const parsedTargetTsConfig = parseTsConfig(targetTsConfigPath);
