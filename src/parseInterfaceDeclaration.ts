import ts from 'typescript';
import { ParsedObject, ParsedProperty } from './ParsedProperty';

export function parseInterfaceDeclaration(
  this: {
    parsePropertySignatureNode(params: {
      debugName?: string;
      tsNode: ts.Node;
      typeArguments?: ts.NodeArray<ts.TypeNode>;
    }): {
      propertyName: string | undefined;
      parsedProperty: ParsedProperty | undefined;
    };
  },
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
): boolean {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;

  if (!ts.isInterfaceDeclaration(tsNode)) {
    return false;
  }

  const objectProperty = parsedProperty as ParsedObject;

  objectProperty.type = 'object';
  objectProperty.value = {};

  tsNode.forEachChild((typeAliasNode) => {
    if (
      !ts.isIdentifier(typeAliasNode) &&
      typeAliasNode.kind !== ts.SyntaxKind.ExportKeyword
    ) {
      const { propertyName, parsedProperty } = this.parsePropertySignatureNode({
        debugName: debugName,
        tsNode: typeAliasNode,
      });

      if (propertyName && parsedProperty) {
        objectProperty.value![propertyName] = parsedProperty;
      }
    }
  });

  return true;
}
