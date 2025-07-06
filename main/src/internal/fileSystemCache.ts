import chokidar from "chokidar";
import { targetProjectAbsRootDir } from "./paths";
import { getModuleFileInfoLight } from "./moduleFileInfo/moduleFileInfoLight";
import { Rule } from "eslint";
import { canProcessFileNameOrDir, getPathsSettings } from "./pathsSettings";

function logModuleTreeCache() {
  console.log();
  console.log("###### modules ######");
  console.log();

  for (const [relModuleDir, files] of [
    ...fileSystemCache.privatePartModuleFiles,
  ]) {
    console.log(relModuleDir);

    for (const filePath of [...files]) {
      console.log("\t" + filePath);
    }
  }
}

function updateCache(absFileName: string, operation: "add" | "remove") {
  const fileInfoLight = getModuleFileInfoLight(absFileName);

  let relModuleDir: string | undefined;

  if (fileInfoLight.moduleFolder.type === "moduleFolderInPrivatePart") {
    relModuleDir = fileInfoLight.moduleFolder.relModuleDir;
  } else {
    relModuleDir = undefined;
  }

  if (operation === "add") {
    if (relModuleDir !== undefined) {
      let moduleFiles =
        fileSystemCache.privatePartModuleFiles.get(relModuleDir);

      if (moduleFiles === undefined) {
        moduleFiles = new Set();
        fileSystemCache.privatePartModuleFiles.set(relModuleDir, moduleFiles);
      }

      moduleFiles.add(absFileName);
    }
  } else {
    if (relModuleDir !== undefined) {
      const moduleFiles =
        fileSystemCache.privatePartModuleFiles.get(relModuleDir);

      if (moduleFiles !== undefined) {
        moduleFiles.delete(absFileName);

        if (moduleFiles.size === 0) {
          fileSystemCache.privatePartModuleFiles.delete(relModuleDir);
        }
      }
    }
  }
}

export type FileSystemCache = {
  /**
   * Ключи - имена уникальных relModuleDir,
   * значения - абсолютные пути файлов внутри приватной части этих модулей.
   *
   * Чтобы получить все уникальные имена существующих папок-модулей, достаточно взять тут ключи,
   * т.к. в валидном модуле всегда есть хотя бы один файл в приватной части.
   * Тут НЕ будут храниться ошибочные модули (с 2мя приватными вложенными папками)
   */
  privatePartModuleFiles: Map<string, Set<string>>;

  initialized: boolean;
};

export const fileSystemCache: FileSystemCache = {
  privatePartModuleFiles: new Map(),

  initialized: false,
};

let initialized = false;

export function initFileSystemCache(context: Rule.RuleContext) {
  if (initialized) {
    return;
  }

  initialized = true;

  console.log("START");

  const pathsSettings = getPathsSettings(context);

  //console.log("init module tree " + targetProjectAbsRootDir);

  // TODO: нужно сделать режим ci/cd в котором не будет запускаться вотчер но будет запускаться
  // на первый запуск полный анализ дерева, но только один раз.
  const watcher = chokidar.watch(targetProjectAbsRootDir, {
    usePolling: false,

    ignored: (fileNameOrDir, stats) => {
      return !canProcessFileNameOrDir(pathsSettings, fileNameOrDir);
    },
  });

  watcher
    .on("add", (path) => {
      updateCache(path, "add");
      //logModuleTreeCache();
    })
    .on("unlink", (path) => {
      updateCache(path, "remove");
      //logModuleTreeCache();
    });

  watcher.on("ready", () => {
    fileSystemCache.initialized = true;
    //console.log("initial file scan complete");
    //logModuleTreeCache();
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
