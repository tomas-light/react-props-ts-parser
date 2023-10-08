import ts from 'typescript';

export function getTypeReferenceIdentifier(
  tsNode: ts.TypeReferenceNode | ts.ExpressionWithTypeArguments
) {
  for (const nodeChild of tsNode.getChildren()) {
    if (ts.isIdentifier(nodeChild)) {
      return nodeChild;
    }
  }
}

export function getTypeReferenceIdentifierSymbol(
  tsNode: ts.TypeReferenceNode,
  typeChecker: ts.TypeChecker
) {
  const identifier = getTypeReferenceIdentifier(tsNode);

  if (identifier) {
    return typeChecker.getSymbolAtLocation(identifier);
  }
}
