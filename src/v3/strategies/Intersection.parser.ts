import ts from 'typescript';
import { ParseFunction } from '../ParseFunction';
import { ParserStrategy } from '../ParserStrategy';
import { ParsedProperty } from '../types';

export class IntersectionParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (!ts.isIntersectionTypeNode(tsNode)) {
      return;
    }

    const parsedProperties: ParsedProperty[] = [];

    tsNode.forEachChild((childNode) => {
      const result = this.globalParse(childNode, options);
      if (result) {
        parsedProperties.push(...result);
      }
    });

    if (parsedProperties.length) {
      return parsedProperties;
    }
  };
}
