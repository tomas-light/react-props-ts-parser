import ts from 'typescript';
import { findImports } from './findImports';
import { getTypeReferenceIdentifier } from './getTypeReferenceIdentifier';
import { ParsedProperty } from './ParsedProperty';
import { ITypeParser } from './ITypeParser';

export function parseImportedType(
  this: Pick<ITypeParser, 'typeChecker' | 'parseType' | 'sourceFile'>,
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

    if (importedType.nameFromWhereImportIs === 'react') {
      if (importedType.identifier.escapedText === 'HTMLAttributes') {
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
    }

    parsedProperty.type = 'imported-type';
    parsedProperty.value = tsNode.getFullText().trim();
    return true;
  }

  return false;
}
