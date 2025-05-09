import fs from 'fs';
import ts from 'typescript';
import { parsedTsConfig } from './tsConfig.js';

/**
 * Ищет коммент с директивой module-folder в заданном файле и возвращает true если найдет
 *
 * @param {string} tsFilePath
 */
export function checkTsSourceHasModuleFolderComment(tsFilePath) {
  const isJsx = tsFilePath.endsWith('.tsx') || tsFilePath.endsWith('.jsx');

  const tsSource = fs.readFileSync(tsFilePath, 'utf8');

  const scanner = ts.createScanner(
    parsedTsConfig.options.target,
    false,
    isJsx ? ts.LanguageVariant.JSX : ts.LanguageVariant.Standard,
    tsSource,
  );

  let kind;

  let braceLevel = 0;
  let parenLevel = 0;

  // Сканируем токены по порядку
  while (true) {
    kind = scanner.scan();

    if (kind === ts.SyntaxKind.EndOfFileToken) {
      return false;
    }

    switch (kind) {
      case ts.SyntaxKind.OpenBraceToken:
        braceLevel++;
        break;
      case ts.SyntaxKind.CloseBraceToken:
        braceLevel--;
        break;
      case ts.SyntaxKind.OpenParenToken:
        parenLevel++;
        break;
      case ts.SyntaxKind.CloseParenToken:
        parenLevel--;
        break;
    }

    if (braceLevel > 0 || parenLevel > 0) {
      continue;
    }

    if (kind === ts.SyntaxKind.SingleLineCommentTrivia) {
      const text = scanner.getTokenText();

      if (/^\/\/ *@module-folder/.test(text)) {
        return true;
      }
    }
  }
}
