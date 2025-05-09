import fs from 'fs';
import { pluginProjectPackageJsonAbsDir } from './paths.js';

export const parsedPackageJson = JSON.parse(
  fs.readFileSync(pluginProjectPackageJsonAbsDir, 'utf8'),
);
