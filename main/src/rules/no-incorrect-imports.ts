import { CodeFileInfo, getCodeFileInfo } from "../internal/fileInfo/fileInfo";
import { PRIVATE_MODULE_DIR_SEGMENT } from "../internal/constants";
import { Rule } from "eslint";
import {
  ModuleFoldersConfig,
  tryImportFromModuleFoldersConfig,
} from "../internal/projectConfigs/moduleFoldersConfig";
import { type Node as EsTreeNode } from "estree";
import { pathToSegments } from "../internal/utils";
import eslintModuleUtilsResolve from "eslint-module-utils/resolve";
import { initFileSystemCache } from "../internal/fileSystemCache";
import {
  canProcessFileNameOrDir,
  getPathsSettings,
} from "../internal/pathsSettings";

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
  // Инициализация файлового кэша при запуске плагина
  // Проходится по всем файлам в проекте (куда присоединен плагин)
  // и кэширует по ним некоторые данные, плюс вешает слежение за изменением
  // файлов в проекте, чтобы перестраивать кэш при изменениях
  initFileSystemCache(context);

  const moduleFoldersConfig = tryImportFromModuleFoldersConfig();

  return {
    ImportDeclaration(node) {
      handleImport(context, moduleFoldersConfig, node, node.source.value);
    },

    ImportExpression(node) {
      if (node.source.type !== "Literal") {
        // Если в динамическом импорте не используется литерал как путь импорта -
        // такое линтер будет тут пропускать, т.к. неизвестно что там за путь может
        // в рантайме получиться. Проверки будут делаться только на константно заданные пути (литералы)

        return;
      }

      handleImport(context, moduleFoldersConfig, node, node.source.value);
    },

    ExportAllDeclaration(node) {
      handleImport(context, moduleFoldersConfig, node, node.source.value);
    },

    ExportNamedDeclaration(node) {
      if (node.source === null || node.source === undefined) {
        return;
      }

      handleImport(context, moduleFoldersConfig, node, node.source.value);
    },
  };
}

function handleImport(
  context: Rule.RuleContext,
  moduleFoldersConfig: ModuleFoldersConfig | null,
  importNode: EsTreeNode,
  importingExpression: unknown
) {
  // Если путь к файлу импорта резолвится не как строка то пропускаем.
  // Не знаю что это за кейсы такие, но вроде как в обычном случае всегда тут строка
  if (typeof importingExpression !== "string") {
    return;
  }

  const validationInfo = startValidation(context, importingExpression);

  if (validationInfo === null) {
    return;
  }

  const { importingFileInfo, thisFileInfo } = validationInfo;

  if (
    !validateMainRules(context, importNode, importingFileInfo, thisFileInfo)
  ) {
    return;
  }

  if (moduleFoldersConfig !== null) {
    validateUserRules(
      context,
      importNode,
      importingFileInfo,
      thisFileInfo,
      moduleFoldersConfig
    );
  }
}

function startValidation(
  context: Rule.RuleContext,
  importingExpression: string
) {
  const importingFileName = eslintModuleUtilsResolve(
    importingExpression,
    context
  );

  if (importingFileName === undefined || importingFileName === null) {
    // undefined будет если это не js/ts файл а файл ресурсов/стилей
    // такие файлы пропускаем

    console.warn(
      `Cannot resolve import from "${importingExpression}". File "${context.filename}"`
    );

    return null;
  }

  const importingFileInfo = getCodeFileInfo(importingFileName);
  const thisFileInfo = getCodeFileInfo(context.filename);

  if (
    thisFileInfo.error !== undefined ||
    importingFileInfo.error !== undefined
  ) {
    // Если один из файлов с неправильно определенной структурой модулей - прекращаем обработку любых правил про модули

    return null;
  }

  const pathsSettings = getPathsSettings(context);

  if (!canProcessFileNameOrDir(pathsSettings, importingFileInfo.relDir)) {
    return null;
  }

  return { importingFileInfo, thisFileInfo };
}

function validateMainRules(
  context: Rule.RuleContext,
  node: EsTreeNode,
  importingFileInfo: CodeFileInfo,
  thisFileInfo: CodeFileInfo
): boolean {
  const thisModuleFolder = thisFileInfo.moduleFolder;
  const importingModuleFolder = importingFileInfo.moduleFolder;

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

    context.report({
      node,
      message: `Importing from another package’s private ${PRIVATE_MODULE_DIR_SEGMENT} directory is not allowed. Use the public import path instead.`,
    });
  }

  return true;
}

function validateUserRules(
  context: Rule.RuleContext,
  node: EsTreeNode,
  importingFileInfo: CodeFileInfo,
  thisFileInfo: CodeFileInfo,
  moduleFoldersConfig: ModuleFoldersConfig
): boolean {
  if (
    importingFileInfo.moduleFolder.type === "notModuleFolder" ||
    thisFileInfo.moduleFolder.type === "notModuleFolder" ||
    importingFileInfo.moduleFolder.relModuleDir ===
      thisFileInfo.moduleFolder.relModuleDir
  ) {
    return true;
  }

  for (const check of moduleFoldersConfig.checks ?? []) {
    const checkRes = check(
      pathToSegments(thisFileInfo.moduleFolder.relModuleDir),
      pathToSegments(importingFileInfo.moduleFolder.relModuleDir)
    );

    if (typeof checkRes === "string") {
      context.report({
        node,
        message: "Cannot import. " + checkRes,
      });

      return false;
    }
  }

  return true;
}
