import { ESLint } from "eslint";

import { parsedPackageJson } from "./internal/parsedPackageJson";
import { noNestedModulesRule } from "./rules/no-nested-modules";
import { noIncorrectImportsRule } from "./rules/no-incorrect-imports";

const plugin: ESLint.Plugin = {
  meta: {
    name: parsedPackageJson.name,
    version: parsedPackageJson.version,
  },

  rules: {
    "no-nested-modules": noNestedModulesRule,
    "no-incorrect-imports": noIncorrectImportsRule,
  },
};

module.exports = { ...plugin };
