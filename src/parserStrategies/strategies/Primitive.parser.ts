import ts from 'typescript';
import { ParserStrategy } from '../ParserStrategy';
import { parseProperty } from './parseProperty';

export class PrimitiveParser extends ParserStrategy {
  parse: ParserStrategy['parse'] = (tsNode) => {
    const debugName = tsNode.getFullText();
    return parseProperty(this.parsePropertyValue, tsNode);
  };

  private parsePropertyValue: ParserStrategy['parse'] = (tsNode) => {
    switch (tsNode.kind) {
      case ts.SyntaxKind.NumberKeyword:
        return [
          {
            type: 'number',
          },
        ];

      case ts.SyntaxKind.BooleanKeyword:
        return [
          {
            type: 'boolean',
          },
        ];

      case ts.SyntaxKind.StringKeyword:
        return [
          {
            type: 'string',
          },
        ];

      case ts.SyntaxKind.UndefinedKeyword:
        return [
          {
            type: 'undefined',
          },
        ];

      case ts.SyntaxKind.SymbolKeyword:
        return [
          {
            type: 'symbol',
          },
        ];

      case ts.SyntaxKind.BigIntKeyword:
        return [
          {
            type: 'bigint',
          },
        ];

      case ts.SyntaxKind.AnyKeyword:
        return [
          {
            type: 'any',
          },
        ];

      case ts.SyntaxKind.UnknownKeyword:
        return [
          {
            type: 'unknown',
          },
        ];

      case ts.SyntaxKind.FunctionType:
      case ts.SyntaxKind.FunctionExpression:
      case ts.SyntaxKind.FunctionKeyword:
      case ts.SyntaxKind.FunctionDeclaration:
        return [
          {
            type: 'function',
          },
        ];
    }

    if (
      ts.isLiteralTypeNode(tsNode) &&
      tsNode.literal.kind === ts.SyntaxKind.NullKeyword
    ) {
      return [
        {
          type: 'null',
        },
      ];
    }
  };
}
