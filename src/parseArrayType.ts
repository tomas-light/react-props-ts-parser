import ts from 'typescript';
import { ParsedProperty, ParsedUnionType } from './ParsedProperty';

export function parseArrayType(
  this: {
    parseType: (params: {
      debugName: string;
      tsNode: ts.Node;
    }) => ParsedProperty;
  },
  params: {
    debugName: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
): boolean {
  const { tsNode, parsedProperty, debugName } = params;

  if (ts.isArrayTypeNode(tsNode)) {
    parsedProperty.type = 'array';
    parsedProperty.values = [];

    tsNode.forEachChild((itemNode) => {
      const itemProperty = this.parseType({
        debugName: itemNode.getFullText(),
        tsNode: itemNode,
      });

      (parsedProperty as ParsedUnionType).values!.push(itemProperty as any);
    });

    return true;
  }

  return false;
}
