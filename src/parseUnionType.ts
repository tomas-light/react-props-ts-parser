import ts from 'typescript';
import { ParsedProperty, ParsedUnionType } from './ParsedProperty';

export function parseUnionType(
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

  if (ts.isUnionTypeNode(tsNode)) {
    parsedProperty.type = 'union-type';
    parsedProperty.values = [];

    tsNode.forEachChild((unionTypeNode) => {
      const unionProperty = this.parseType({
        tsNode: unionTypeNode,
        debugName: debugName,
      });

      (parsedProperty as ParsedUnionType).values!.push(unionProperty);
    });

    return true;
  }

  return false;
}
