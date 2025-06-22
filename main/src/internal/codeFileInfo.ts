import path from "path";
import fs from "fs";
import { targetProjectAbsRootDir } from "./paths";
import { PRIVATE_MODULE_DIR_SEGMENT } from "./constants";
import { pathToSegments, segmentsToPath } from "./utils";

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

    // TODO: нужно какой-то кэш сохранять вместо того чтобы каждый раз лезть в реальную файловую систему,
    // но нужно понимать когда его инвалидировать
    // вероятно придется делать слежение за файловой системой.
    // у меня в старом коде уже есть реализация такого слежения с кэшированием
    // надо вытащить эту реализацию. Скорее всего тут очень похоже будет.
    // Также можно сделать флаг что файлы гарантированно не будут меняться,
    // чтобы не включать это слежение (но кэш наверное все равно будет)
    // это может чуть ускорить наверно на ci/cd выполнение правил.
    if (
      checkIfDirectoryExists(
        path.join(
          targetProjectAbsRootDir,
          ...currentSegments,
          PRIVATE_MODULE_DIR_SEGMENT
        )
      )
    ) {
      return {
        type: "moduleFolder",
        isInPrivatePart: false,
        relModuleDir: segmentsToPath(currentSegments),
      };
    }
  }

  return { type: "notModuleFolder" };
}

function checkIfDirectoryExists(dir: string) {
  try {
    const stats = fs.statSync(dir);
    return stats.isDirectory();
  } catch (err) {
    return false;
  }
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
