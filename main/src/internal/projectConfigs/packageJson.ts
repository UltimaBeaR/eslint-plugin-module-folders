import fs from "fs";
import { pluginProjectPackageJsonAbsDir } from "../paths.js";

export const parsedPluginPackageJson: PackageJson = JSON.parse(
  fs.readFileSync(pluginProjectPackageJsonAbsDir, "utf8")
);

export type PackageJson = {
  name?: string | undefined;
  version?: string | undefined;
};
