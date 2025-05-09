import path from 'path';
import { projectAbsRootDir } from './paths.js';

/**
 * @param {string} importingAbsFileName
 */
export function getImportingFileSubfolderDirs(importingAbsFileName) {
  const relativePath = path.relative(projectAbsRootDir, path.dirname(importingAbsFileName));

  // под-папки (только имена папок, без путей) по всему пути импорта, относительно корня проекта
  const subFolders = relativePath.split(path.sep).filter((segment) => segment !== '');

  const results = [];

  let currentFolderPath = projectAbsRootDir;

  results.push(currentFolderPath);
  for (const subFolder of subFolders) {
    currentFolderPath = path.join(currentFolderPath, subFolder);

    results.push(currentFolderPath);
  }

  return results;
}
