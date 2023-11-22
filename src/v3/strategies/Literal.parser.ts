import ts from 'typescript';
import { InternalParseFunction } from '../ParseFunction';
import { ParserStrategy } from '../ParserStrategy';
import { ParsedProperty } from '../types';

export class LiteralParser extends ParserStrategy {
  parsePropertyValue: InternalParseFunction = (tsNode) => {
    const debugName = tsNode.getFullText();

    if (ts.isLiteralTypeNode(tsNode)) {
      return this.parseLiteral(tsNode.literal);
    }

    return this.parseLiteral(tsNode);
  };

  private parseLiteral(literalNode: ts.Node): ParsedProperty[] | undefined {
    if (ts.isNumericLiteral(literalNode)) {
      return [
        {
          type: 'number-literal',
          value: parseInt(literalNode.text, 10),
        },
      ];
    }

    if (ts.isStringLiteral(literalNode)) {
      return [
        {
          type: 'string-literal',
          value: literalNode.text,
        },
      ];
    }

    if (ts.isBigIntLiteral(literalNode)) {
      let value: bigint | undefined;
      try {
        // "25n" => "25"
        const sanitizedValue = literalNode.text.substring(
          0,
          literalNode.text.length - 1
        );
        value = BigInt(sanitizedValue);
      } catch (error) {
        console.error(error);
      }

      return [
        {
          type: 'bigint-literal',
          value: value,
        },
      ];
    }

    if (literalNode.kind === ts.SyntaxKind.TrueKeyword) {
      return [
        {
          type: 'boolean-literal',
          value: true,
        },
      ];
    }

    if (literalNode.kind === ts.SyntaxKind.FalseKeyword) {
      return [
        {
          type: 'boolean-literal',
          value: false,
        },
      ];
    }
  }
}
