import path from "path";
import { targetProjectAbsRootDir } from "./paths";
import { PRIVATE_MODULE_DIR_SEGMENT } from "./constants";
import { pathToSegments, segmentsToPath } from "./utils";

export function getFileInfo(fileName: string) {
  const absFileName = path.resolve(fileName);
  const absDir = path.dirname(path.resolve(fileName));

  const relDir = path.relative(targetProjectAbsRootDir, absDir);

  const relDirSegments = pathToSegments(relDir);

  const hasNestedPrivateModuleDirSegments =
    checkHasNestedPrivateModuleDirSegments(relDirSegments);

  const firstPrivateModuleDirSegments =
    getFirstPrivateModuleDirSegments(relDirSegments);
  const firstPrivateModuleRelDir = segmentsToPath(
    firstPrivateModuleDirSegments
  );

  const isInPrivateModuleDir = firstPrivateModuleRelDir !== "";

  let relModuleDir = "";

  if (isInPrivateModuleDir) {
    relModuleDir = path.dirname(firstPrivateModuleRelDir);
  }

  return {
    fileName,
    absFileName,
    relDir,
    firstPrivateModuleRelDir,
    relModuleDir,
    isInPrivateModuleDir,
    hasNestedPrivateModuleDirSegments,
  };
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
