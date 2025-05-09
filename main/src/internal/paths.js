import path from 'node:path';

// -------------------- пути текущего проекта (проект с плагином)

/** Путь к текущему проекту (проект с плагином) */
export const pluginProjectRootAbsDir = path.join(import.meta.dirname, '../..');

export const pluginProjectPackageJsonAbsDir = path.join(pluginProjectRootAbsDir, 'package.json');

// -------------------- пути проекта, в котором запускаются правил

/** Путь к проекту, в котором запускается плагин (на котором отрабатывают правила плагина) */
export const projectAbsRootDir = path.resolve(process.cwd());

export const projectNodeModulesAbsDir = path.join(projectAbsRootDir, 'node_modules');

console.log('module-folders paths info', {
  pluginProjectRootAbsDir,
  pluginProjectPackageJsonAbsDir,
  projectAbsRootDir,
  projectNodeModulesAbsDir,
});
