import path from "node:path";
import { projectNodeModulesAbsDir } from "./internal/paths.js";
import { resolveTsImport } from "./internal/resolveTsImport.js";
import { getTsFileModuleInfo } from "./internal/getTsFileModuleInfo.js";
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
  return {};

  return {
    ImportDeclaration(node) {
      const imporerFileName = context.filename;
      const importingExpression = node.source.value;

      // Если путь к файлу импорта резолвится не как строка то пропускаем.
      // Не знаю что это за кейсы такие, но вроде как в обычном случае всегда тут строка
      if (typeof importingExpression !== "string") {
        return;
      }

      const importingFileName = resolveTsImport(
        importingExpression,
        imporerFileName
      );

      // undefined будет если это не js/ts файл а файл ресурсов/стилей
      // такие файлы пропускаем
      if (importingFileName === undefined) {
        return;
      }

      // Пропускаем импорты из node_modules
      if (importingFileName.startsWith(projectNodeModulesAbsDir + path.sep)) {
        return;
      }

      const importingModuleInfo = getTsFileModuleInfo(importingFileName);
      const importerModuleInfo = getTsFileModuleInfo(imporerFileName);

      /*
        TODO:
        Общая логика правил, не только для этого правила конкретного.
        Можно попробовать ее вынести в хэлпер и переиспользовать в разных правилах.
        Ну либо пусть будет одно правило но с разными сообщениями.

        Отдельное правило, что в определенной папке должны быть ТОЛЬКО модули и больше никаких других файлов
          if текущий файл находится в этой папке (из списка, должен задаваться конфигом), при этом
          этот файл не файл модуля и в его пути нигде нету модулей и на уровне его основной папки нет файлов-модулей
            ошибка - найден файл вне модулей, хотя папка должна быть только с модулями внутри
          else
            все ок.

        Отдельное правило, проверяющее сам файл текущий на коммент @module топ левел.
          Проверяем по кэшу модульный ли этот файл, если нет, игнорим этот файл (значит коммент не топ левел)
          if в кэше есть - проверяем что выше по пути импорта нет других модулей.
            if есть
              ругаемся что не может быть вложенных модулей.

        if импортируемый файл это модуль
          if этот модуль является тем же модулем откуда идет импорт (ситуация если импорт вида ../index.ts)
            то пишем что файлы модулей могут быть использованы только для внешнего кода
          else
            все ок - это импорт чужого модуля (тут дальше можно правила fsd слайсов и т.д. подключать)
        else
          if в пути импорта где то есть модуль (ищем только первый, не важно какой)
            if этот модуль является тем же модулем откуда идет импорт (в случае если текущий файл тоже в модуле)
              все ок - импорт из кишков своего же модуля
            else
              ругаемся что доступ напрямую к файла из кишков модуля идет напрямую а не через импорт файла модуля.
          else
            все ок - импорт из какого-то кода, который вообще не усавствует в модульной системе

      */

      console.log("###### ImportDeclaration", {
        imporerFileName,
        importerModuleInfo,
        importingFileName,
        importingModuleInfo,
      });

      if (false) {
        context.report({
          node,
          message: "Не нашел коммент // @module-folder",
        });
      }
    },
  };
}
