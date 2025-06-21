import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import { projectAbsRootDir, projectNodeModulesAbsDir } from "./paths.js";
import { checkTsSourceHasModuleFolderComment } from "./checkTsSourceHasModuleFolderComment.js";

/** @type {import('./moduleTree').Cache} */
export const moduleTreeCache = { files: new Map(), fileFolders: new Map() };

export function logModuleTreeCache() {
  console.log();
  console.log("###### files ######");
  console.log();

  for (const [path, fileCache] of [...moduleTreeCache.files]) {
    console.log("key: " + path);
    console.log("absPath" + fileCache.absPath);
    console.log("isModule: " + fileCache.isModule);
  }

  console.log();
  console.log("###### folders ######");
  console.log();

  for (const [path, files] of [...moduleTreeCache.fileFolders]) {
    console.log("key: " + path);
    console.log("fileCount: " + files.size);
    console.log("isModule: " + [...files.values()].some((x) => x.isModule));
  }
}

/**
 * @param {string} absFileName
 */
export function changeModuleTreeCache(absFileName) {
  const isRemoving = !fs.existsSync(absFileName);

  const fileFolderName = path.dirname(absFileName);

  if (isRemoving) {
    moduleTreeCache.files.delete(absFileName);

    const fileFolder = moduleTreeCache.fileFolders.get(fileFolderName);
    fileFolder.delete(absFileName);
    if (fileFolder.size === 0) {
      moduleTreeCache.fileFolders.delete(fileFolderName);
    }
  } else {
    let fileCache;
    if (moduleTreeCache.files.has(absFileName)) {
      fileCache = moduleTreeCache.files.get(absFileName);
    } else {
      fileCache = {
        absPath: absFileName,
        isModule: false,
      };
      moduleTreeCache.files.set(absFileName, fileCache);
    }

    fileCache.isModule = checkTsSourceHasModuleFolderComment(absFileName);

    let fileFolderCache;
    if (moduleTreeCache.fileFolders.has(fileFolderName)) {
      fileFolderCache = moduleTreeCache.fileFolders.get(fileFolderName);
    } else {
      fileFolderCache = new Map();
      moduleTreeCache.fileFolders.set(fileFolderName, fileFolderCache);
    }

    if (!fileFolderCache.has(absFileName)) {
      fileFolderCache.set(absFileName, fileCache);
    }
  }
}

export function runWatcher() {
  // TODO: нужно сделать режим ci/cd в котором не будет запускаться вотчер но будет запускаться
  // на первый запуск полный анализ дерева, но только один раз.
  const watcher = chokidar.watch(projectAbsRootDir, {
    usePolling: false,

    ignored: (fileNameOrDir, stats) => {
      if (fileNameOrDir.startsWith(projectNodeModulesAbsDir + path.sep)) {
        return true;
      }

      if (stats === undefined) {
        return false;
      }

      if (!stats.isFile()) {
        return false;
      }

      const isCodeFile = [".js", ".jsx", ".ts", ".tsx"].includes(
        path.extname(fileNameOrDir).toLowerCase()
      );

      return !isCodeFile;
    },
  });

  watcher
    .on("add", (path) => {
      changeModuleTreeCache(path);
      logModuleTreeCache();
    })
    .on("change", (path) => {
      changeModuleTreeCache(path);
      logModuleTreeCache();
    })
    .on("unlink", (path) => {
      changeModuleTreeCache(path);
      logModuleTreeCache();
    });

  watcher.on("ready", () => {
    console.log("initial file scan complete");

    logModuleTreeCache();

    // TODO: если работаем в режиме ci/cd то наверное можно тут отключить вотчер на этом моменте, т.к
    // он тут был нужен только для изначального заполнения кэша.
  });

  process.on("exit", () => {
    watcher.close();
  });

  process.on("SIGINT", async () => {
    await watcher.close();
    process.exit();
  });
}
