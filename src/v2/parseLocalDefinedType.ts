import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';
import { parseGenericPropertyAsConstraint } from './parseGenericPropertyAsConstraint';
import { ITypeParser } from './ITypeParser';

export function parseLocalDefinedType(
  this: Pick<ITypeParser, 'typeChecker' | 'parseType'>,
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  },
) {
  const {
    tsNode,
    parsedProperty,
    debugName = tsNode.getFullText(),
    typeArguments,
  } = params;

  if (!ts.isTypeReferenceNode(tsNode)) {
    return false;
  }

  let identifierSymbol: ts.Symbol | undefined;
  for (const nodeChild of tsNode.getChildren()) {
    if (ts.isIdentifier(nodeChild)) {
      identifierSymbol = this.typeChecker.getSymbolAtLocation(nodeChild);
      break;
    }
  }

  const symbolDeclarations = identifierSymbol?.getDeclarations();
  if (!symbolDeclarations?.length) {
    return false;
  }

  const [declaration] = symbolDeclarations;

  if (
    symbolDeclarations.length === 1 &&
    (ts.isTypeAliasDeclaration(declaration) ||
      ts.isInterfaceDeclaration(declaration))
  ) {
    if (
      typeArguments?.length ||
      (tsNode as { typeArguments?: unknown[] }).typeArguments?.length
    ) {
      return false;
    }

    const tsType = this.typeChecker.getTypeAtLocation(tsNode);
    if (
      parseGenericPropertyAsConstraint({
        debugName,
        parsedProperty,
        tsType,
      })
    ) {
      return true;
    }

    this.parseType({
      tsNode: declaration,
      parsedProperty,
    });
    return true;
  }

  return false;
}
