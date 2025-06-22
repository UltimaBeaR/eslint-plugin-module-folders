import { ESLint } from "eslint";

import { parsedPluginPackageJson } from "./internal/projectConfigs/packageJson";
import { noNestedModulesRule } from "./rules/no-nested-modules";
import { noIncorrectImportsRule } from "./rules/no-incorrect-imports";

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
      plugins: ["module-folders"],
      rules: {
        "module-folders/no-nested-modules": "error",
        "module-folders/no-incorrect-imports": "error",
      },
    },
  },
} satisfies ESLint.Plugin;

// Note: такой экспорт чтобы в commonjs в рантайме работало, иначе не хочет
module.exports = plugin;

// Note: такой экспорт чтобы тайпинги правильно генерились (в рантайме используется commonjs экспорт)
export default plugin;
