import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';
import { ITypeParser } from './ITypeParser';

export function parseTypeAlias(
  this: Pick<ITypeParser, 'parseType'>,
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
): boolean {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;

  if (!ts.isTypeAliasDeclaration(tsNode)) {
    return false;
  }

  tsNode.forEachChild((typeAliasNode) => {
    if (
      !ts.isIdentifier(typeAliasNode) &&
      typeAliasNode.kind !== ts.SyntaxKind.ExportKeyword
    ) {
      this.parseType({
        debugName: debugName,
        tsNode: typeAliasNode,
        parsedProperty,
      });
    }
  });

  return true;
}
