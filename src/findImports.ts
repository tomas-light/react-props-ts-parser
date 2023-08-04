import ts from 'typescript';

export function findImports(sourceFile: ts.SourceFile) {
  const imports: {
    identifier: ts.Identifier;
    nameFromWhereImportIs: string;
  }[] = [];

  ts.forEachChild(sourceFile, (tsNode) => {
    if (!ts.isImportDeclaration(tsNode)) {
      return;
    }

    const children = tsNode.getChildren();

    const nameFromWhereImportIs = trimQuotesFromString(
      children
        .find((childNode) => ts.isStringLiteral(childNode))
        ?.getFullText(),
    );

    const importClause = children.find((childNode) =>
      ts.isImportClause(childNode),
    );
    if (!importClause) {
      return;
    }

    const importChildren = importClause.getChildren();
    const defaultImport = importChildren.find((node) =>
      ts.isIdentifier(node),
    ) as ts.Identifier | undefined;

    if (defaultImport) {
      imports.push({
        identifier: defaultImport,
        nameFromWhereImportIs: nameFromWhereImportIs!,
      });
      return;
    }

    const namedImports = importChildren.find((node) => ts.isNamedImports(node));
    if (!namedImports) {
      return;
    }

    const syntaxListNode = namedImports
      .getChildren()
      .find((node) => node.kind === ts.SyntaxKind.SyntaxList);
    if (!syntaxListNode) {
      return;
    }

    const importSpecifiers = syntaxListNode
      .getChildren()
      .filter((node) => ts.isImportSpecifier(node));
    if (!importSpecifiers.length) {
      return;
    }

    const importIdentifiers = importSpecifiers.flatMap((node) =>
      node.getChildren().filter((childNode) => ts.isIdentifier(childNode)),
    ) as ts.Identifier[];
    if (!importIdentifiers.length) {
      return;
    }

    if (nameFromWhereImportIs) {
      importIdentifiers.forEach((identifier) => {
        imports.push({
          identifier,
          nameFromWhereImportIs: nameFromWhereImportIs!,
        });
      });
    }
  });

  return imports;
}

// "'react'" => "react"
function trimQuotesFromString(importString: string | undefined) {
  if (!importString) {
    return importString;
  }

  importString = importString.trim();

  const SINGLE_QUOTE = "'";
  const DOUBLE_QUOTE = '"';

  const containsSingleQuotes =
    importString.indexOf(SINGLE_QUOTE) === 0 &&
    importString.lastIndexOf(SINGLE_QUOTE) === importString.length - 1;

  const containsDoubleQuotes =
    importString.indexOf(DOUBLE_QUOTE) === 0 &&
    importString.lastIndexOf(DOUBLE_QUOTE) === importString.length - 1;

  if (containsSingleQuotes || containsDoubleQuotes) {
    return importString.substring(1, importString.length - 1);
  }

  return importString;
}

function getTypeExportedModule(tsType: ts.Type) {
  let module = (tsType.symbol ?? tsType.aliasSymbol) as ts.Symbol & {
    parent?: ts.Symbol;
  };

  while (module?.parent) {
    module = module.parent;
    if (module.exports) {
      // we assume that it is React root type
      break;
    }
  }

  return module as ts.Symbol;
}
