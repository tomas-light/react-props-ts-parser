import ts from 'typescript';
import { ParseFunction } from '../ParseFunction';
import { ParserStrategy } from '../ParserStrategy';
import { ParsedObject } from '../types';

export class TypeLiteralParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (!ts.isTypeLiteralNode(tsNode)) {
      return;
    }

    const parsedProperties: ParsedObject = {
      type: 'object',
      value: [],
    };

    tsNode.forEachChild((propertyNode) => {
      const nodeText = propertyNode.getFullText();

      const result = this.globalParse(propertyNode, options);
      if (result) {
        parsedProperties.value!.push(...result);
      }
    });

    return [parsedProperties];
  };
}
