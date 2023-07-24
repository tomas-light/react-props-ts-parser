import ts from 'typescript';
import { findImports } from './findImports';
import { getTypeReferenceIdentifier } from './getTypeReferenceIdentifier';
import { ParsedProperty } from './ParsedProperty';

export function parseImportedType(
  this: {
    sourceFile: ts.SourceFile;
    typeChecker: ts.TypeChecker;
    parseType(params: {
      tsNode: ts.Node;
      parsedProperty?: ParsedProperty;
    }): ParsedProperty;
  },
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
): boolean {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;

  if (!ts.isTypeReferenceNode(tsNode)) {
    return false;
  }

  const identifier = getTypeReferenceIdentifier(tsNode);

  let identifierSymbol: ts.Symbol | undefined;
  if (identifier) {
    identifierSymbol = this.typeChecker.getSymbolAtLocation(identifier);
  }

  const symbolDeclarations = identifierSymbol?.getDeclarations();
  if (!symbolDeclarations?.length) {
    return false;
  }

  const isImport = symbolDeclarations.some(
    (declaration) =>
      ts.isImportSpecifier(declaration) ||
      ts.isImportClause(declaration) ||
      ts.isExternalModuleReference(declaration),
  );

  if (isImport) {
    const imports = findImports.call(this);

    const importedType = imports.find((_import) => {
      const _symbol = this.typeChecker.getSymbolAtLocation(_import.identifier);
      return _symbol === identifierSymbol;
    });
    if (!importedType) {
      return false;
    }

    const isLocalImport = importedType.nameFromWhereImportIs.startsWith('.');
    if (isLocalImport) {
      const tsType = this.typeChecker.getTypeAtLocation(identifier!);
      const typeDeclarations = (
        tsType.symbol ?? tsType.aliasSymbol
      )?.getDeclarations();

      if (typeDeclarations?.length === 1) {
        this.parseType({
          tsNode: typeDeclarations[0],
          parsedProperty,
        });
        return true;
      }
    }

    parsedProperty.type = 'imported-type';
    parsedProperty.value = tsNode.getFullText().trim();
    return true;
  }

  const typeName = identifierSymbol?.getName();
  if (typeName && ['Set', 'Map'].includes(typeName)) {
    parsedProperty.type = 'not-parsed';
    parsedProperty.value = tsNode.getFullText().trim();
    return true;
  }

  return false;
}
