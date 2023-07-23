import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';

export function parsePrimitiveType(params: {
  debugName?: string;
  tsNode: ts.Node;
  parsedProperty: ParsedProperty;
}): boolean {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;

  switch (tsNode.kind) {
    case ts.SyntaxKind.NumberKeyword:
      parsedProperty.type = 'number';
      return true;

    case ts.SyntaxKind.BooleanKeyword:
      parsedProperty.type = 'boolean';
      return true;

    case ts.SyntaxKind.StringKeyword:
      parsedProperty.type = 'string';
      return true;

    case ts.SyntaxKind.UndefinedKeyword:
      parsedProperty.type = 'undefined';
      return true;

    case ts.SyntaxKind.SymbolKeyword:
      parsedProperty.type = 'symbol';
      return true;

    case ts.SyntaxKind.BigIntKeyword:
      parsedProperty.type = 'bigint';
      return true;

    case ts.SyntaxKind.AnyKeyword:
      parsedProperty.type = 'any';
      return true;

    case ts.SyntaxKind.UnknownKeyword:
      parsedProperty.type = 'unknown';
      return true;

    case ts.SyntaxKind.FunctionType:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.FunctionKeyword:
    case ts.SyntaxKind.FunctionDeclaration:
      parsedProperty.type = 'function';
      return true;
  }

  if (
    ts.isLiteralTypeNode(tsNode) &&
    tsNode.literal.kind === ts.SyntaxKind.NullKeyword
  ) {
    parsedProperty.type = 'null';
    return true;
  }

  return false;
}
