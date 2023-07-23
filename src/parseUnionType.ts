import ts from 'typescript';
import { ParsedProperty, ParsedUnionType } from './ParsedProperty';

export function parseUnionType(
  this: {
    parseType: (params: { tsNode: ts.Node }) => ParsedProperty;
  },
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
): boolean {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;

  if (!ts.isUnionTypeNode(tsNode)) {
    return false;
  }

  const unionType = parsedProperty as ParsedUnionType;

  unionType.type = 'union-type';
  unionType.values = [];

  tsNode.forEachChild((childNode) => {
    const unionProperty = this.parseType({
      tsNode: childNode,
    });

    unionType.values!.push(unionProperty);
  });

  return true;
}
