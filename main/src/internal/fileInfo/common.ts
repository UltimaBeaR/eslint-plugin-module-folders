import { PRIVATE_MODULE_DIR_SEGMENT } from "../constants";

export function getFirstPrivateModuleDirSegments(segments: string[]): string[] {
  const firstPrivateModuleDirSegments = [];

  for (const segment of segments) {
    firstPrivateModuleDirSegments.push(segment);

    if (segment === PRIVATE_MODULE_DIR_SEGMENT) {
      return firstPrivateModuleDirSegments;
    }
  }

  return [];
}

export function checkHasNestedPrivateModuleDirSegments(
  segments: string[]
): boolean {
  let privateModuleDirSegmentsCount = 0;

  for (const segment of segments) {
    if (segment === PRIVATE_MODULE_DIR_SEGMENT) {
      privateModuleDirSegmentsCount++;
    }
  }

  return privateModuleDirSegmentsCount > 1;
}
