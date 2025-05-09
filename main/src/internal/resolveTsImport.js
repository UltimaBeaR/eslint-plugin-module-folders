import ts from 'typescript';
import { parsedTsConfig } from './tsConfig.js';

const compilerHost = ts.createCompilerHost(parsedTsConfig.options, true);

/**
 * Возвращает путь к ts файлу (также может быть tsx, js, jsx)
 *
 * @param {string} importSource значение import директивы (откуда идет импорт)
 * @param {string} importerFile путь к файлу из которого идет импорт (вызов import директивы)
 */
export function resolveTsImport(importSource, importerFile) {
  const { resolvedModule } = ts.resolveModuleName(
    importSource,
    importerFile,
    parsedTsConfig.options,
    compilerHost,
  );
  return resolvedModule?.resolvedFileName;
}
