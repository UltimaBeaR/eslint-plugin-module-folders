import path from "node:path";

// -------------------- пути текущего проекта (проект с плагином)

/** Путь к текущему проекту (проект с плагином) */
export const pluginProjectRootAbsDir = path.join(__dirname, "../..");

export const pluginProjectPackageJsonAbsDir = path.join(
  pluginProjectRootAbsDir,
  "package.json"
);

// -------------------- пути проекта, в котором запускаются правил

/** Путь к проекту, в котором запускается плагин (на котором отрабатывают правила плагина) */
export const projectAbsRootDir = path.resolve(process.cwd());

// console.log("module-folders paths info", {
//   pluginProjectRootAbsDir,
//   pluginProjectPackageJsonAbsDir,
//   projectAbsRootDir,
// });
