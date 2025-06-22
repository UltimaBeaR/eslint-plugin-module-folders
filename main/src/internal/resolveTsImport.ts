import ts from "typescript";
import { parsedTsConfig } from "./tsConfig.js";

const compilerHost = ts.createCompilerHost(parsedTsConfig.options, true);

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
    parsedTsConfig.options,
    compilerHost
  );
  return resolvedModule?.resolvedFileName;
}
