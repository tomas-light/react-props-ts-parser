import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';

export function parseTypeAlias(
  this: {
    parseType: (params: {
      debugName: string;
      tsNode: ts.Node;
      parsedProperty: ParsedProperty;
    }) => ParsedProperty;
  },
  params: {
    debugName: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
): boolean {
  const { tsNode, parsedProperty, debugName } = params;

  if (!ts.isTypeAliasDeclaration(tsNode)) {
    return false;
  }

  tsNode.forEachChild((typeAliasNode) => {
    if (!ts.isIdentifier(typeAliasNode)) {
      this.parseType({
        debugName: debugName,
        tsNode: typeAliasNode,
        parsedProperty,
      });
    }
  });

  return true;
}
