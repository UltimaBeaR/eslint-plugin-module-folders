import { Rule } from "eslint";
import { PRIVATE_MODULE_DIR_SEGMENT } from "../internal/constants";
import { getCodeFileInfo } from "../internal/codeFileInfo";

export const noNestedModulesRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow nested module folders",
    },
    schema: [],
  },
  create,
};

function create(context: Rule.RuleContext): Rule.NodeListener {
  return {
    Program(node) {
      const thisFileInfo = getCodeFileInfo(context.filename);

      if (thisFileInfo.error === "hasNestedPrivateModuleDirSegments") {
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
