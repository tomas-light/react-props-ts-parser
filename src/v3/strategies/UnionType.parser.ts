import ts from 'typescript';
import { ParseFunction } from '../ParseFunction';
import { ParserStrategy } from '../ParserStrategy';
import { ParsedUnionType } from '../types';

export class UnionTypeParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (!ts.isUnionTypeNode(tsNode)) {
      return;
    }

    const parsedProperty: ParsedUnionType = {
      type: 'union-type',
      value: [],
    };

    tsNode.forEachChild((itemNode) => {
      const unionProperties = this.globalParse(itemNode, options);
      if (unionProperties) {
        parsedProperty.value!.push(...unionProperties);
      }
    });

    return [parsedProperty];
  };
}