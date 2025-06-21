import { getImportingFileSubfolderDirs } from "./getImportingFileSubfolderDirs.js";
import { moduleTreeCache } from "./moduleTree.js";

/**
 * @param {string} tsFilePath
 */
export function getTsFileModuleInfo(tsFilePath) {
  const subFolderDirs = getImportingFileSubfolderDirs(tsFilePath);

  const moduleSubfolders = subFolderDirs.filter((subFolderDir) => {
    if (moduleTreeCache.fileFolders.has(subFolderDir)) {
      const filesMap = moduleTreeCache.fileFolders.get(subFolderDir);

      const isModule = [...filesMap.values()].some(
        (fileCache) => fileCache.isModule
      );

      return isModule;
    }

    return false;
  });

  const tsFilePathIsModule =
    moduleTreeCache.files.has(tsFilePath) &&
    moduleTreeCache.files.get(tsFilePath).isModule;

  return {
    // moduleFolder - путь до папки с модулем,
    //

    pathIsModule: tsFilePathIsModule,
    moduleFolders: moduleSubfolders,
  };
}
