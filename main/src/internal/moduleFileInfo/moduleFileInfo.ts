import fs from "fs";
import path from "path";
import { targetProjectAbsRootDir } from "../paths";
import { pathToSegments, segmentsToPath } from "../utils";
import {
  checkHasNestedPrivateModuleDirSegments,
  getFirstPrivateModuleDirSegments,
} from "./common";
import { fileSystemCache } from "../fileSystemCache";
import { PRIVATE_MODULE_DIR_SEGMENT } from "../constants";

export type ModuleFileInfo = {
  absFileName: string;

  relDirSegments: string[];
  relDir: string;

  error: "hasNestedPrivateModuleDirSegments" | undefined;

  moduleFolder:
    | {
        type: "moduleFolder";
        relModuleDir: string;
        isInPrivatePart: boolean;
      }
    | { type: "notModuleFolder" };
};

export function getModuleFileInfo(fileName: string): ModuleFileInfo {
  const absFileName = path.resolve(fileName);
  const absDir = path.dirname(path.resolve(fileName));

  const relDir = path.relative(targetProjectAbsRootDir, absDir);

  const relDirSegments = pathToSegments(relDir);

  const hasNestedPrivateModuleDirSegments =
    checkHasNestedPrivateModuleDirSegments(relDirSegments);

  const moduleFolder: ModuleFileInfo["moduleFolder"] =
    hasNestedPrivateModuleDirSegments
      ? { type: "notModuleFolder" }
      : getModuleFolder(relDirSegments);

  const result: ModuleFileInfo = {
    absFileName,

    relDirSegments,
    relDir,

    error: hasNestedPrivateModuleDirSegments
      ? "hasNestedPrivateModuleDirSegments"
      : undefined,

    moduleFolder,
  };

  return result;
}

function getModuleFolder(
  relDirSegments: string[]
): ModuleFileInfo["moduleFolder"] {
  const firstPrivateModuleDirSegments =
    getFirstPrivateModuleDirSegments(relDirSegments);
  const firstPrivateModuleRelDir = segmentsToPath(
    firstPrivateModuleDirSegments
  );

  if (firstPrivateModuleRelDir !== "") {
    return {
      type: "moduleFolder",
      isInPrivatePart: true,
      relModuleDir: path.dirname(firstPrivateModuleRelDir),
    };
  }

  for (
    let segmentIdx = relDirSegments.length - 1;
    segmentIdx >= 0;
    segmentIdx--
  ) {
    const currentSegments = relDirSegments.slice(0, segmentIdx + 1);

    const relModuleDir = segmentsToPath(currentSegments);

    if (checkFsIsPrivateModuleFolderExists(relModuleDir)) {
      return {
        type: "moduleFolder",
        isInPrivatePart: false,
        relModuleDir: relModuleDir,
      };
    }
  }

  return { type: "notModuleFolder" };
}

function checkFsIsPrivateModuleFolderExists(relModuleDir: string) {
  // TODO: возможно если нужен будет режим работы без кэша файловой системы, то тогда
  // тут надо будет зайти в файловую систему по заданному пути модуля relModuleDir
  // и проверить папку
  // path.join(targetProjectAbsRootDir, relModuleDir, PRIVATE_MODULE_DIR_SEGMENT)
  // что она существует и в ней есть хотя бы один любой файл. Если да то считается что приватная папка модуля существует
  // Такая же логика идет в кэшированной файловой системе

  if (fileSystemCache.initialized) {
    return fileSystemCache.privatePartModuleFiles.has(relModuleDir);
  } else {
    const res = hasFilesInDir(
      path.join(
        targetProjectAbsRootDir,
        relModuleDir,
        PRIVATE_MODULE_DIR_SEGMENT
      )
    );

    console.log(relModuleDir, res);

    return res;
  }
}

export function hasFilesInDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return false;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile()) {
      return true;
    }

    if (entry.isDirectory()) {
      if (hasFilesInDir(path.join(dir, entry.name))) {
        return true;
      }
    }
  }

  return false;
}
