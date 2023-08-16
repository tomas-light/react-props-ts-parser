import ts from 'typescript';
import {
  ParsedBigIntLiteral,
  ParsedBooleanLiteral,
  ParsedNumberLiteral,
  ParsedObject,
  ParsedProperty,
  ParsedStringLiteral,
} from './ParsedProperty';
import { ITypeParser } from './ITypeParser';

export function parseLiteralType(
  this: Pick<ITypeParser, 'parsePropertySignatureNode'>,
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
): boolean {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;

  if (ts.isLiteralTypeNode(tsNode)) {
    return handleLiterals.call(this, tsNode.literal);
  }

  return handleLiterals.call(this, tsNode);

  function handleLiterals(
    this: Pick<ITypeParser, 'parsePropertySignatureNode'>,
    tsNode: ts.Node,
  ) {
    if (ts.isNumericLiteral(tsNode)) {
      parsedProperty.type = 'number-literal';
      (parsedProperty as ParsedNumberLiteral).value = parseInt(tsNode.text, 10);
      return true;
    }

    if (ts.isStringLiteral(tsNode)) {
      parsedProperty.type = 'string-literal';
      (parsedProperty as ParsedStringLiteral).value = tsNode.text;
      return true;
    }

    if (ts.isBigIntLiteral(tsNode)) {
      parsedProperty.type = 'bigint-literal';
      try {
        // "25n" => "25"
        const sanitizedValue = tsNode.text.substring(0, tsNode.text.length - 1);
        (parsedProperty as ParsedBigIntLiteral).value = BigInt(sanitizedValue);
      } catch (error) {
        console.error(error);
      }
      return true;
    }

    if (tsNode.kind === ts.SyntaxKind.TrueKeyword) {
      parsedProperty.type = 'boolean-literal';
      (parsedProperty as ParsedBooleanLiteral).value = true;
      return true;
    }

    if (tsNode.kind === ts.SyntaxKind.FalseKeyword) {
      parsedProperty.type = 'boolean-literal';
      (parsedProperty as ParsedBooleanLiteral).value = false;
      return true;
    }

    if (tsNode.kind === ts.SyntaxKind.TypeLiteral) {
      const parsedObject = parsedProperty as ParsedObject;

      parsedObject.type = 'object';
      parsedObject.value = {};

      tsNode.forEachChild((itemNode) => {
        const { propertyName, parsedProperty: objectProperty } =
          this.parsePropertySignatureNode({
            tsNode: itemNode,
          });

        if (propertyName && objectProperty) {
          parsedObject.value![propertyName] = objectProperty;
        }
      });

      return true;
    }

    return false;
  }
}
