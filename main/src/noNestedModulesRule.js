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
      const fileInfo = getFileInfo(context.filename);

      console.log("###### Program", {
        fileInfo,
      });
    },
  };
}
