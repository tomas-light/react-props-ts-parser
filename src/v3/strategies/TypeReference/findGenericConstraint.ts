import ts, { SyntaxKind } from 'typescript';
import { InternalParseOptions } from '../../ParseFunction';

export function findGenericConstraint(
  genericParameterNode: ts.TypeParameterDeclaration,
  options: InternalParseOptions
) {
  let identifierSymbol: ts.Symbol | undefined;
  let hasExtendsKeyword = false;
  let constraint: ts.Node | undefined;

  for (const child of genericParameterNode.getChildren()) {
    const nodeText = child.getFullText();

    if (ts.isIdentifier(child)) {
      identifierSymbol = options.typeChecker.getSymbolAtLocation(child);
    } else if (child.kind === SyntaxKind.ExtendsKeyword) {
      hasExtendsKeyword = true;
    } else if (hasExtendsKeyword) {
      constraint = child;
    }
  }

  return {
    identifierSymbol,
    constraint,
  };
}
