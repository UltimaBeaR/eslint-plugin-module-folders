import path from "path";

/**
 * @param {string} pathStr
 * @returns {string[]}
 */
export function pathToSegments(pathStr) {
  return pathStr.split(path.sep).filter((segment) => segment !== "");
}

/**
 * @param {string[]} segments
 * @returns {string}
 */
export function segmentsToPath(segments) {
  return segments.join(path.sep);
}
