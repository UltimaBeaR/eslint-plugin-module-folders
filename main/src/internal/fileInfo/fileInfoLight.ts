import path from "path";

import { targetProjectAbsRootDir } from "../paths";
import { pathToSegments, segmentsToPath } from "../utils";
import {
  checkHasNestedPrivateModuleDirSegments,
  getFirstPrivateModuleDirSegments,
} from "./common";

export type FileInfoLight = {
  absFileName: string;

  relDirSegments: string[];
  relDir: string;

  error: "hasNestedPrivateModuleDirSegments" | undefined;

  moduleFolder:
    | {
        type: "moduleFolderInPrivatePart";
        relModuleDir: string;
      }
    | { type: "notModuleFolder" }
    | { type: "unknown" };
};

/** Получает всю возможную информацию по файлу из его имени, без попыток доступа в файловую систему */
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
      type: "moduleFolderInPrivatePart",
      relModuleDir: path.dirname(firstPrivateModuleRelDir),
    };
  }

  return { type: "unknown" };
}
