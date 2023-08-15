import ts from 'typescript';
import { getTypeReferenceIdentifierSymbol } from '../../getTypeReferenceIdentifier';
import { ParsedArray } from '../../ParsedProperty';
import { ParserStrategy } from '../ParserStrategy';
import { parseProperty } from './parseProperty';

export class ArrayParser extends ParserStrategy {
  parse: ParserStrategy['parse'] = (tsNode, options) => {
    const debugName = tsNode.getFullText();
    return parseProperty(this.parsePropertyValue, tsNode, options);
  };

  private parsePropertyValue: ParserStrategy['parse'] = (tsNode, options) => {
    const { typeChecker } = options;

    if (ts.isArrayTypeNode(tsNode)) {
      return this.parseArray(tsNode, options);
    }

    if (ts.isTypeReferenceNode(tsNode)) {
      const identifierSymbol = getTypeReferenceIdentifierSymbol(
        tsNode,
        typeChecker,
      );

      const typeName = identifierSymbol?.getName();
      if (typeName && ['Array', 'ReadonlyArray'].includes(typeName)) {
        return this.parseArray(tsNode, options);
      }
    }

    // readonlyArrayNode: readonly string[];
    if (ts.isTypeOperatorNode(tsNode)) {
      for (const readonlyChildNode of tsNode.getChildren()) {
        const result = this.parsePropertyValue(readonlyChildNode, options);
        if (result) {
          return result;
        }
      }
    }
  };

  private parseArray: ParserStrategy['parse'] = (tsNode, options) => {
    const parsedProperty: ParsedArray = {
      type: 'array',
      values: [],
    };

    tsNode.forEachChild((itemNode) => {
      // skip Array or ReadonlyArray identifier
      if (ts.isIdentifier(itemNode)) {
        return;
      }

      const itemProperty = this.globalParse(itemNode, options);
      if (itemProperty) {
        parsedProperty.values!.push(...itemProperty);
      }
    });

    return [parsedProperty];
  };
}
