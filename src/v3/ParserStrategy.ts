import ts from 'typescript';
import { ParseFunction } from './ParseFunction';
import { parsePropertySignature } from './strategies/parsePropertySignature';

export abstract class ParserStrategy {
  constructor(protected readonly globalParse: ParseFunction) {}

  parse: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (ts.isPropertySignature(tsNode)) {
      return parsePropertySignature(this.parsePropertyValue, tsNode, options);
    }

    const parsedProperties = this.parsePropertyValue(tsNode, options);
    if (parsedProperties?.length) {
      return parsedProperties;
    }
  };

  abstract parsePropertyValue: ParseFunction;
}
