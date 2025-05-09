import ts from 'typescript';
import path from 'node:path';
import { projectAbsRootDir } from './paths.js';

/**
 * @param {string} tsconfigPath
 */
function parseTsConfig(tsconfigPath) {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  return ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsconfigPath));
}

// TODO: сделать нормальный поиск tsconfig / jsconfig, пока тут хардкод - просто в корне проекта tsconfig
// Либо сделать такой хардкод и возможность через настройки плагина задавать путь к этому конфигу

const tsconfigPath = path.resolve(path.join(projectAbsRootDir, 'tsconfig.json'));
if (!tsconfigPath) {
  throw new Error('tsconfig.json not found');
}

export const parsedTsConfig = parseTsConfig(tsconfigPath);
