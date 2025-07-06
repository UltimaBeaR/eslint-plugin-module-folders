import { Rule } from "eslint";
import { PRIVATE_MODULE_DIR_SEGMENT } from "../internal/constants";
import { getModuleFileInfo } from "../internal/moduleFileInfo/moduleFileInfo";
import { initFileSystemCache } from "../internal/fileSystemCache";

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
  // Инициализация файлового кэша при запуске плагина
  // Проходится по всем файлам в проекте (куда присоединен плагин)
  // и кэширует по ним некоторые данные, плюс вешает слежение за изменением
  // файлов в проекте, чтобы перестраивать кэш при изменениях
  initFileSystemCache(context);

  return {
    Program(node) {
      const thisFileInfo = getModuleFileInfo(context.filename);

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
