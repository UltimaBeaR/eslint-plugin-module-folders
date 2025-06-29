# eslint-plugin-module-folders

Support for folder as a module pattern

# Installation

`npm install --save-dev eslint eslint-plugin-module-folders eslint-plugin-import eslint-import-resolver-typescript`

# Configuration

## Configure eslint

Minimal config (typescript) - eslint.config.js

```js
import globals from "globals";
import jseslint from "@eslint/js";
import tseslint from "typescript-eslint";
import moduleFoldersPlugin from "eslint-plugin-module-folders";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [jseslint.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      // other plugins
    },
    rules: {
      // other rules
    },
  },
  {
    ...moduleFoldersPlugin.configs.recommended,
    plugins: {
      "module-folders": moduleFoldersPlugin,
      import: importPlugin,
    },
  }
);
```

## Custom module folder import rules

Create `module-folders.config.сjs` in project root folder.

```js
/** @type {import('eslint-plugin-module-folders').ModuleFoldersConfig} */
const config = {
  checks: [
    (modulePath, importingModulePath) => {
      // TODO:
      // custom module folder import rules
      // modulePath and importingModulePath are module folders paths

      // if import is correct
      // return null;

      // if import is incorrect
      return (
        'Can''t import from "' +
        importingModulePath +
        '" module folder to "' +
        modulePath +
        '" module folder'
      );
    },
  ],
};

module.exports = config;
```
