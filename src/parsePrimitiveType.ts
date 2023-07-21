import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';

export function parsePrimitiveType(params: {
  debugName: string;
  tsNode: ts.Node;
  parsedProperty: ParsedProperty;
}): boolean {
  const { tsNode, parsedProperty, debugName } = params;

  if (tsNode.kind === ts.SyntaxKind.NumberKeyword) {
    parsedProperty.type = 'number';
    return true;
  }

  if (tsNode.kind === ts.SyntaxKind.BooleanKeyword) {
    parsedProperty.type = 'boolean';
    return true;
  }

  if (tsNode.kind === ts.SyntaxKind.StringKeyword) {
    parsedProperty.type = 'string';
    return true;
  }

  if (tsNode.kind === ts.SyntaxKind.UndefinedKeyword) {
    parsedProperty.type = 'undefined';
    return true;
  }

  if (
    ts.isLiteralTypeNode(tsNode) &&
    tsNode.literal.kind === ts.SyntaxKind.NullKeyword
  ) {
    parsedProperty.type = 'null';
    return true;
  }

  if (tsNode.kind === ts.SyntaxKind.SymbolKeyword) {
    parsedProperty.type = 'symbol';
    return true;
  }

  if (tsNode.kind === ts.SyntaxKind.BigIntKeyword) {
    parsedProperty.type = 'bigint';
    return true;
  }

  if (ts.isFunctionTypeNode(tsNode)) {
    parsedProperty.type = 'function';
    return true;
  }

  if (tsNode.kind === ts.SyntaxKind.AnyKeyword) {
    parsedProperty.type = 'any';
    return true;
  }

  if (tsNode.kind === ts.SyntaxKind.UnknownKeyword) {
    parsedProperty.type = 'unknown';
    return true;
  }

  return false;
}
