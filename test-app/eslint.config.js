import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import moduleFolders from "eslint-plugin-module-folders";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import moduleFoldersPlugin from "eslint-plugin-module-folders";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      // "react-refresh": reactRefresh,
      "module-folders": moduleFoldersPlugin,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // "react-refresh/only-export-components": [
      //   "warn",
      //   { allowConstantExport: true },
      // ],
      ...moduleFolders.configs.recommended.rules,
    },
    settings: {
      ...moduleFolders.configs.recommended.settings,
    },
  }
);
