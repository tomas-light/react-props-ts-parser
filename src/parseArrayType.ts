import ts from 'typescript';
import { ParsedArray, ParsedProperty } from './ParsedProperty';

export function parseArrayType(
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

  if (!ts.isArrayTypeNode(tsNode)) {
    return false;
  }

  const parsedArrayProperty = parsedProperty as ParsedArray;

  parsedArrayProperty.type = 'array';
  parsedArrayProperty.values = [];

  tsNode.forEachChild((itemNode) => {
    const itemProperty = this.parseType({
      tsNode: itemNode,
    });

    parsedArrayProperty.values!.push(itemProperty);
  });

  return true;
}
