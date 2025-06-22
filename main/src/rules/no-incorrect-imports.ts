import path from "node:path";
import { resolveTsImport } from "../internal/resolveTsImport";
import { getCodeFileInfo } from "../internal/codeFileInfo";
import { PRIVATE_MODULE_DIR_SEGMENT } from "../internal/constants";
import { Rule } from "eslint";
import { tryImportFromModuleFoldersConfig } from "../internal/projectConfigs/moduleFoldersConfig";

export const noIncorrectImportsRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Allow only correct imports from module folders",
    },
    schema: [],
  },
  create,
};

function create(context: Rule.RuleContext): Rule.NodeListener {
  const importRes = tryImportFromModuleFoldersConfig();

  const res = (importRes as any).data.checks[0]("one", "two");

  console.log("tessssst", { res });

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

function validateMainRules(
  context: Rule.RuleContext,
  importingExpression: string
) {
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

  const importingFileInfo = getCodeFileInfo(importingFileName);
  const thisFileInfo = getCodeFileInfo(context.filename);

  if (
    thisFileInfo.error !== undefined ||
    importingFileInfo.error !== undefined
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

  const thisModuleFolder = thisFileInfo.moduleFolder;
  const importingModuleFolder = importingFileInfo.moduleFolder;

  console.log("---", {
    self: { name: thisFileInfo.absFileName, ...thisModuleFolder },
    imp: { name: importingFileInfo.absFileName, ...importingModuleFolder },
  });

  if (
    importingModuleFolder.type === "moduleFolder" &&
    importingModuleFolder.isInPrivatePart
  ) {
    // Если импортируем из приватной части

    if (
      thisModuleFolder.type === "moduleFolder" &&
      thisModuleFolder.relModuleDir === importingModuleFolder.relModuleDir
    ) {
      // Если импортируем кишки модуля из любой части (приватной или нет) этого же самого модуля
      // то такое пропускаем (это нормальная ситуация)

      return true;
    }

    // Если дошли сюда значит это импорт из приватной части модуля из тех мест откуда
    // импорт запрещен

    return false;
  }

  return true;
}
