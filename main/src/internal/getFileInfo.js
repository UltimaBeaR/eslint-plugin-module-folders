import path from "path";
import { projectAbsRootDir } from "./paths.js";
import { PRIVATE_MODULE_DIR_SEGMENT } from "./constants.js";
import { pathToSegments, segmentsToPath } from "./utils.js";

/**
 * @param {string} fileName
 */
export function getFileInfo(fileName) {
  const absFileName = path.resolve(fileName);
  const absDir = path.dirname(path.resolve(fileName));

  const relDir = path.relative(projectAbsRootDir, absDir);

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

/**
 * @param {string[]} segments
 * @returns {string[]}
 */
function getFirstPrivateModuleDirSegments(segments) {
  const firstPrivateModuleDirSegments = [];

  for (const segment of segments) {
    firstPrivateModuleDirSegments.push(segment);

    if (segment === PRIVATE_MODULE_DIR_SEGMENT) {
      return firstPrivateModuleDirSegments;
    }
  }

  return [];
}

/**
 * @param {string[]} segments
 * @returns {boolean}
 */
function checkHasNestedPrivateModuleDirSegments(segments) {
  let privateModuleDirSegmentsCount = 0;

  for (const segment of segments) {
    if (segment === PRIVATE_MODULE_DIR_SEGMENT) {
      privateModuleDirSegmentsCount++;
    }
  }

  return privateModuleDirSegmentsCount > 1;
}
