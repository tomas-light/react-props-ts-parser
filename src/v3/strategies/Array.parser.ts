import ts from 'typescript';
import { getTypeReferenceIdentifierSymbol } from '../../getTypeReferenceIdentifier';
import { ParseFunction } from '../ParseFunction';
import { ParserStrategy } from '../ParserStrategy';
import { ParsedArray } from '../types';

export class ArrayParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (ts.isArrayTypeNode(tsNode)) {
      return this.parseArray(tsNode, options);
    }

    // prop: readonly string[];
    if (ts.isTypeOperatorNode(tsNode)) {
      for (const readonlyChildNode of tsNode.getChildren()) {
        const result = this.parsePropertyValue(readonlyChildNode, options);
        if (result) {
          return result;
        }
      }
    }
  };

  /** @warning use it only after checks on related node type */
  parseArray: ParseFunction = (tsNode, options) => {
    const parsedProperty: ParsedArray = {
      type: 'array',
      value: [],
    };

    tsNode.forEachChild((itemNode) => {
      const itemProperties = this.globalParse(itemNode, options);
      if (itemProperties) {
        parsedProperty.value!.push(...itemProperties);
      }
    });

    return [parsedProperty];
  };
}
