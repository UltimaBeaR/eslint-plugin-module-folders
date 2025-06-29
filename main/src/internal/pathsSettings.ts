import { Rule } from "eslint";
import path from "path";

export type PathsSettings = {
  externalFolders: string[];
  includePaths: string[];
  excludePaths: string[];
};

export function getPathsSettings(context: Rule.RuleContext): PathsSettings {
  // читаем из settings

  const externalFolders = (context.settings?.[
    "import/external-module-folders"
  ] as string[] | undefined) ?? ["node_modules"];

  // TODO: наверное надо еще делать поддержку internal-regex, раз я юзаю правила из import плагина
  // https://github.com/import-js/eslint-plugin-import?tab=readme-ov-file#importinternal-regex

  const includePaths =
    (context.settings?.["module-folders/include"] as string[] | undefined) ??
    [];

  const excludePaths =
    (context.settings?.["module-folders/exclude"] as string[] | undefined) ??
    [];

  return { externalFolders, includePaths, excludePaths };
}

export function canProcessFileNameOrDir(
  pathsSettings: PathsSettings,
  fileNameOrDir: string
) {
  // TODO: externalFolders - тут должно быть сложнее.
  // См. https://github.com/import-js/eslint-plugin-import?tab=readme-ov-file#importexternal-module-folders

  for (const externalFolder of pathsSettings.externalFolders) {
    if (fileNameOrDir.startsWith(externalFolder + path.sep)) {
      return false;
    }
  }

  // TODO: inlcude и exclude пути я просто по префиксам проверяю
  // это неправильно и будет глючить точно
  // Вместо этого надо какую то либу с glob паттернами тут заюзать и ей проверять

  for (const excludePath of pathsSettings.excludePaths) {
    if (fileNameOrDir.startsWith(excludePath + path.sep)) {
      return false;
    }
  }

  if (pathsSettings.includePaths.length === 0) {
    return true;
  }

  for (const includePath of pathsSettings.includePaths) {
    if (fileNameOrDir.startsWith(includePath + path.sep)) {
      return false;
    }
  }

  return false;
}
