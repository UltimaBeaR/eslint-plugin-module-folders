import path from "path";
import { targetProjectAbsRootDir } from "./paths";
import { PRIVATE_MODULE_DIR_SEGMENT } from "./constants";
import { pathToSegments, segmentsToPath } from "./utils";
import { fileSystemCache } from "./fileSystemCache";

export type FileInfoLight = {
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
    | { type: "notModuleFolder" }
    | { type: "unknown" };
};

export type CodeFileInfo = {
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

export function getFileInfoLight(fileName: string): FileInfoLight {
  const absFileName = path.resolve(fileName);
  const absDir = path.dirname(path.resolve(fileName));

  const relDir = path.relative(targetProjectAbsRootDir, absDir);

  const relDirSegments = pathToSegments(relDir);

  const hasNestedPrivateModuleDirSegments =
    checkHasNestedPrivateModuleDirSegments(relDirSegments);

  const moduleFolder: FileInfoLight["moduleFolder"] =
    hasNestedPrivateModuleDirSegments
      ? { type: "notModuleFolder" }
      : getModuleFolderLight(relDirSegments);

  const result: FileInfoLight = {
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

function getModuleFolderLight(
  relDirSegments: string[]
): FileInfoLight["moduleFolder"] {
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

  return { type: "unknown" };
}

export function getCodeFileInfo(codeFileName: string): CodeFileInfo {
  const absFileName = path.resolve(codeFileName);
  const absDir = path.dirname(path.resolve(codeFileName));

  const relDir = path.relative(targetProjectAbsRootDir, absDir);

  const relDirSegments = pathToSegments(relDir);

  const hasNestedPrivateModuleDirSegments =
    checkHasNestedPrivateModuleDirSegments(relDirSegments);

  const moduleFolder: CodeFileInfo["moduleFolder"] =
    hasNestedPrivateModuleDirSegments
      ? { type: "notModuleFolder" }
      : getModuleFolder(relDirSegments);

  const result: CodeFileInfo = {
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
): CodeFileInfo["moduleFolder"] {
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

  return fileSystemCache.privatePartModuleFiles.has(relModuleDir);
}

function getFirstPrivateModuleDirSegments(segments: string[]): string[] {
  const firstPrivateModuleDirSegments = [];

  for (const segment of segments) {
    firstPrivateModuleDirSegments.push(segment);

    if (segment === PRIVATE_MODULE_DIR_SEGMENT) {
      return firstPrivateModuleDirSegments;
    }
  }

  return [];
}

function checkHasNestedPrivateModuleDirSegments(segments: string[]): boolean {
  let privateModuleDirSegmentsCount = 0;

  for (const segment of segments) {
    if (segment === PRIVATE_MODULE_DIR_SEGMENT) {
      privateModuleDirSegmentsCount++;
    }
  }

  return privateModuleDirSegmentsCount > 1;
}
