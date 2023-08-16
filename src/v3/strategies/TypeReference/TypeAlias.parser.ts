import ts from 'typescript';
import { ParseFunction } from '../../ParseFunction';
import { ParserStrategy } from '../../ParserStrategy';
import { ParsedProperty } from '../../types';

export class TypeAliasParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (!ts.isTypeAliasDeclaration(tsNode)) {
      return;
    }

    const parsedProperties: ParsedProperty[] = [];

    tsNode.forEachChild((typeAliasNode) => {
      const result = this.globalParse(typeAliasNode, options);
      if (result) {
        parsedProperties.push(...result);
      }
    });

    if (parsedProperties.length) {
      return parsedProperties;
    }
  };
}
