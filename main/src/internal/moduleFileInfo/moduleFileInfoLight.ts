import path from "path";

import { targetProjectAbsRootDir } from "../paths";
import { pathToSegments, segmentsToPath } from "../utils";
import {
  checkHasNestedPrivateModuleDirSegments,
  getFirstPrivateModuleDirSegments,
} from "./common";

export type ModuleFileInfoLight = {
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
export function getModuleFileInfoLight(fileName: string): ModuleFileInfoLight {
  const absFileName = path.resolve(fileName);
  const absDir = path.dirname(path.resolve(fileName));

  const relDir = path.relative(targetProjectAbsRootDir, absDir);

  const relDirSegments = pathToSegments(relDir);

  const hasNestedPrivateModuleDirSegments =
    checkHasNestedPrivateModuleDirSegments(relDirSegments);

  const moduleFolder: ModuleFileInfoLight["moduleFolder"] =
    hasNestedPrivateModuleDirSegments
      ? { type: "notModuleFolder" }
      : getModuleFolderLight(relDirSegments);

  const result: ModuleFileInfoLight = {
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
): ModuleFileInfoLight["moduleFolder"] {
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
