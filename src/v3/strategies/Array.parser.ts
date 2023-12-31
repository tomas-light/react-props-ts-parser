import ts from 'typescript';
import { InternalParseFunction } from '../ParseFunction';
import { ParserStrategy } from '../ParserStrategy';
import { ParsedArray } from '../types';

export class ArrayParser extends ParserStrategy {
  parsePropertyValue: InternalParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (ts.isArrayTypeNode(tsNode)) {
      return this.parseArray(tsNode, options);
    }

    // prop: readonly string[];
    if (ts.isTypeOperatorNode(tsNode)) {
      for (const readonlyChildNode of tsNode.getChildren()) {
        const nodeText = readonlyChildNode.getFullText();

        const result = this.parsePropertyValue(readonlyChildNode, options);
        if (result) {
          return result;
        }
      }
    }
  };

  /** @warning use it only after checks on related node type */
  parseArray: InternalParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText().trim();

    const parsedProperty: ParsedArray = {
      type: 'array',
      nodeText: debugName,
      value: [],
    };

    tsNode.forEachChild((itemNode) => {
      const nodeText = itemNode.getFullText();

      const itemProperties = this.globalParse(itemNode, options);
      if (itemProperties) {
        parsedProperty.value!.push(...itemProperties);
      }
    });

    return [parsedProperty];
  };
}
