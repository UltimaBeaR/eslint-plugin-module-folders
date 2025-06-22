import ts from "typescript";
import { parsedTargetTsConfig } from "./projectConfigs/tsConfig";

const compilerHost = ts.createCompilerHost(parsedTargetTsConfig.options, true);

/**
 * Возвращает путь к ts файлу (также может быть tsx, js, jsx)
 *
 * @param importSource значение import директивы (откуда идет импорт)
 * @param importerFile путь к файлу из которого идет импорт (вызов import директивы)
 */
export function resolveTsImport(importSource: string, importerFile: string) {
  const { resolvedModule } = ts.resolveModuleName(
    importSource,
    importerFile,
    parsedTargetTsConfig.options,
    compilerHost
  );
  return resolvedModule?.resolvedFileName;
}
