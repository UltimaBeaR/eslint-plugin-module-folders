import path from "path";

export function pathToSegments(pathStr: string): string[] {
  return pathStr.split(path.sep).filter((segment) => segment !== "");
}

export function segmentsToPath(segments: string[]): string {
  return segments.join(path.sep);
}
