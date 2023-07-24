import ts from 'typescript';

export function getTypeReferenceIdentifier(tsNode: ts.TypeReferenceNode) {
  let identifier: ts.Identifier | undefined;

  for (const nodeChild of tsNode.getChildren()) {
    if (ts.isIdentifier(nodeChild)) {
      identifier = nodeChild;
      break;
    }
  }

  return identifier;
}
