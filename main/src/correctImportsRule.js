import path from "node:path";
import { resolveTsImport } from "./internal/resolveTsImport.js";
import { getFileInfo } from "./internal/getFileInfo.js";
import { PRIVATE_MODULE_DIR_SEGMENT } from "./internal/constants.js";
/**
 * @type {import('eslint').Rule.RuleModule}
 */
export const correctImportsRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Только корректный импорт папок-модулей",
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
    ImportDeclaration(node) {
      const importingExpression = node.source.value;

      // Если путь к файлу импорта резолвится не как строка то пропускаем.
      // Не знаю что это за кейсы такие, но вроде как в обычном случае всегда тут строка
      if (typeof importingExpression !== "string") {
        return;
      }

      const validated = validateMainRules(context, importingExpression);

      if (!validated) {
        context.report({
          node,
          message:
            "Cannot import from someone else's private " +
            PRIVATE_MODULE_DIR_SEGMENT +
            " folder. Use public import path instead",
        });
      }
    },

    ImportExpression(node) {
      if (node.source.type !== "Literal") {
        // Если в динамическом импорте не используется литерал как путь импорта -
        // такое линтер будет тут пропускать, т.к. неизвестно что там за путь может
        // в рантайме получиться. Проверки будут делаться только на константно заданные пути (литералы)

        return;
      }

      const importingExpression = node.source.value;

      // Если путь к файлу импорта резолвится не как строка то пропускаем.
      // Не знаю что это за кейсы такие, но вроде как в обычном случае всегда тут строка
      if (typeof importingExpression !== "string") {
        return;
      }

      const validated = validateMainRules(context, importingExpression);

      if (!validated) {
        context.report({
          node,
          message:
            "Cannot import from someone else's private " +
            PRIVATE_MODULE_DIR_SEGMENT +
            " folder. Use public import path instead",
        });
      }
    },

    ExportAllDeclaration(node) {
      const importingExpression = node.source.value;

      // Если путь к файлу импорта резолвится не как строка то пропускаем.
      // Не знаю что это за кейсы такие, но вроде как в обычном случае всегда тут строка
      if (typeof importingExpression !== "string") {
        return;
      }

      const validated = validateMainRules(context, importingExpression);

      if (!validated) {
        context.report({
          node,
          message:
            "Cannot import from someone else's private " +
            PRIVATE_MODULE_DIR_SEGMENT +
            " folder. Use public import path instead",
        });
      }
    },

    ExportNamedDeclaration(node) {
      const importingExpression = node.source?.value;

      // Если путь к файлу импорта резолвится не как строка то пропускаем.
      // Не знаю что это за кейсы такие, но вроде как в обычном случае всегда тут строка
      if (typeof importingExpression !== "string") {
        return;
      }

      const validated = validateMainRules(context, importingExpression);

      if (!validated) {
        context.report({
          node,
          message:
            "Cannot import from someone else's private " +
            PRIVATE_MODULE_DIR_SEGMENT +
            " folder. Use public import path instead",
        });
      }
    },
  };
}

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {string} importingExpression
 */
function validateMainRules(context, importingExpression) {
  // TODO: сделать поддержку импортов не только тайпскрипта
  const importingFileName = resolveTsImport(
    importingExpression,
    context.filename
  );

  if (importingFileName === undefined) {
    // undefined будет если это не js/ts файл а файл ресурсов/стилей
    // такие файлы пропускаем

    return true;
  }

  const importingFileInfo = getFileInfo(importingFileName);
  const thisFileInfo = getFileInfo(context.filename);

  if (
    thisFileInfo.hasNestedPrivateModuleDirSegments ||
    importingFileInfo.hasNestedPrivateModuleDirSegments
  ) {
    // Если один из файлов с неправильно определенной структурой модулей - прекращаем обработку любых правил про модули

    return true;
  }

  // TODO: вместо этого должен быть include/exclude конфиг
  // по дефолту будет exclude: "/node_modules/**" или типа того
  // и тут как раз будет проверяться - нужно ли процессить файл
  // (или даже раньше, в самом начале, до получения инфы о файле вообще.
  // Но делать это надо по относительному от корня проекту пути)
  //
  // Пропускаем импорты из node_modules
  if (importingFileInfo.relDir.startsWith("node_modules" + path.sep)) {
    return true;
  }

  if (importingFileInfo.isInPrivateModuleDir) {
    // Если импортируемый файл находится внутри приватной части папки-модуля

    const importingRelModuleDir = importingFileInfo.relModuleDir;

    if (
      thisFileInfo.isInPrivateModuleDir &&
      thisFileInfo.relModuleDir === importingRelModuleDir
    ) {
      // Если идет импорт в кишки модуля из кишков этого же самого модуля
      // то это нормальная ситуация - такое пропускаем

      return true;
    }

    if (
      !thisFileInfo.isInPrivateModuleDir &&
      (thisFileInfo.relDir === importingRelModuleDir ||
        thisFileInfo.relDir.startsWith(importingRelModuleDir + path.sep))
    ) {
      // Если идет импорт в кишки модуля из файлов публичного апи этого же самого модуля
      // то это нормальная ситуация и такое пропускаем.
      // Публичное апи никогда не находится в приватной части модуля и всегда находится
      // либо в папке модуля (не приватной, а основной), либо в подпапках в этой папке, но
      // не внутри приватной части.

      return true;
    }

    // Если дошли сюда значит это импорт из приватной части модуля из тех мест откуда
    // импорт запрещен

    return false;
  }

  return true;
}
