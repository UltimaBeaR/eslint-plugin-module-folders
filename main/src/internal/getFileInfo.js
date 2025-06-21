import path from "path";
import { projectAbsRootDir } from "./paths.js";

/**
 * @param {string} fileName
 */
export function getFileInfo(fileName) {
  const absFileName = path.resolve(fileName);
  const absDir = path.dirname(path.resolve(fileName));

  const relDir = path.relative(projectAbsRootDir, absDir);

  const relDirSegments = pathToSegments(relDir);
  const firstPrivateModuleDirSegments =
    getFirstPrivateModuleDirSegments(relDirSegments);
  const firstPrivateModuleRelDir = segmentsToPath(
    firstPrivateModuleDirSegments
  );

  let relModuleDir = "";

  if (firstPrivateModuleRelDir !== "") {
    relModuleDir = path.dirname(firstPrivateModuleRelDir);
  }

  return {
    fileName,
    absFileName,
    relDir,
    firstPrivateModuleRelDir,
    relModuleDir,
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

const PRIVATE_MODULE_DIR_SEGMENT = "_module";

/**
 * @param {string} pathStr
 * @returns {string[]}
 */
function pathToSegments(pathStr) {
  return pathStr.split(path.sep).filter((segment) => segment !== "");
}

/**
 * @param {string[]} segments
 * @returns {string}
 */
function segmentsToPath(segments) {
  return segments.join(path.sep);
}
