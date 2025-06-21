import { PRIVATE_MODULE_DIR_SEGMENT } from "./internal/constants.js";
import { getFileInfo } from "./internal/getFileInfo.js";

/**
 * @type {import('eslint').Rule.RuleModule}
 */
export const noNestedModulesRule = {
  meta: {
    type: "problem",
    docs: {
      description: "No nested modules",
    },
    schema: [],
  },
  create,
};

/**
 * @type {import('eslint').Rule.RuleModule['create']}
 */
function create(context) {
  return {
    Program(node) {
      const thisFileInfo = getFileInfo(context.filename);

      if (thisFileInfo.hasNestedPrivateModuleDirSegments) {
        context.report({
          node,
          message:
            "Nested " + PRIVATE_MODULE_DIR_SEGMENT + " folders are not allowed",
        });
        return;
      }
    },
  };
}
