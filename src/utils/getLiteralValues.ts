import ts from 'typescript';
import { defined } from '../defined';

export function getLiteralValues(typeNode: ts.TypeNode): (string | number)[] {
  if (ts.isLiteralTypeNode(typeNode)) {
    return [typeNode].map(getLiteralValue).filter(defined);
  }

  const literalNodes: ts.LiteralTypeNode[] = [];

  typeNode.forEachChild((node) => {
    if (ts.isLiteralTypeNode(node)) {
      literalNodes.push(node);
      return;
    }

    if (ts.isUnionTypeNode(node)) {
      node.forEachChild((unionNode) => {
        if (ts.isLiteralTypeNode(unionNode)) {
          literalNodes.push(unionNode);
        }
      });
    }
  });

  return literalNodes.map(getLiteralValue).filter(defined);
}

function getLiteralValue(literalTypeNode: ts.LiteralTypeNode) {
  if (ts.isNumericLiteral(literalTypeNode.literal)) {
    return parseInt(literalTypeNode.literal.text, 10);
  }

  if (ts.isStringLiteral(literalTypeNode.literal)) {
    return literalTypeNode.literal.text;
  }
}
