import { ESLint } from "eslint";

import { parsedPluginPackageJson } from "./internal/projectConfigs/packageJson";
import { noNestedModulesRule } from "./rules/no-nested-modules";
import { noIncorrectImportsRule } from "./rules/no-incorrect-imports";
import { initFileSystemCache } from "./internal/fileSystemCache";

// Инициализация файлового кэша при запуске плагина
// Проходится по всем файлам в проекте (куда присоединен плагин)
// и кэширует по ним некоторые данные, плюс вешает слежение за изменением
// файлов в проекте, чтобы перестраивать кэш при изменениях
initFileSystemCache();

const plugin = {
  meta: {
    name: parsedPluginPackageJson.name,
    version: parsedPluginPackageJson.version,
  },

  rules: {
    "no-nested-modules": noNestedModulesRule,
    "no-incorrect-imports": noIncorrectImportsRule,
  },

  configs: {
    recommended: {
      plugins: ["module-folders", "import"],
      rules: {
        "module-folders/no-nested-modules": "error",
        "module-folders/no-incorrect-imports": "error",
      },
      settings: {
        "import/resolver": {
          typescript: {},
        },
      },
    },
  },
} satisfies ESLint.Plugin;

// Note: такой экспорт чтобы в commonjs в рантайме работало, иначе не хочет
module.exports = plugin;

// Note: такой экспорт чтобы тайпинги правильно генерились (в рантайме используется commonjs экспорт)
export default plugin;

export type { ModuleFoldersConfig } from "./internal/projectConfigs/moduleFoldersConfig";
