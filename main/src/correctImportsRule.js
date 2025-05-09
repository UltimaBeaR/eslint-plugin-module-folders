import path from 'node:path';
import { projectNodeModulesAbsDir } from './internal/paths.js';
import { resolveTsImport } from './internal/resolveTsImport.js';
import { getTsFileModuleInfo } from './internal/getTsFileModuleInfo.js';
/**
 * @type {import('eslint').Rule.RuleModule}
 */
export const correctImportsRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Только корректный импорт папок-модулей',
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
      const imporerFileName = context.filename;
      const importingExpression = node.source.value;

      // Если путь к файлу импорта резолвится не как строка то пропускаем.
      // Не знаю что это за кейсы такие, но вроде как в обычном случае всегда тут строка
      if (typeof importingExpression !== 'string') {
        return;
      }

      const importingFileName = resolveTsImport(importingExpression, imporerFileName);

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

      console.log('###### ImportDeclaration', {
        importingFileName,
        importingModuleInfo,
        imporerFileName,
        importerModuleInfo,
      });

      if (false) {
        context.report({
          node,
          message: 'Не нашел коммент // @module-folder',
        });
      }
    },
  };
}
