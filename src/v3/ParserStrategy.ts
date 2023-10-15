import ts from 'typescript';
import { ParseFunction, ParseOptions } from './ParseFunction';
import { parsePropertySignature } from './strategies/parsePropertySignature';
import { CachedParsedProperty } from './types';

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

  protected cache(
    options: ParseOptions,
    identifierSymbol: ts.Symbol,
    propertyToCache: CachedParsedProperty
  ) {
    const {
      cachedParsedMap,
      passedGenericConstraintsAsParameterToNestedGeneric,
    } = options;

    const cachedProperty = cachedParsedMap.get(identifierSymbol);
    if (!cachedProperty) {
      cachedParsedMap.set(identifierSymbol, propertyToCache);
    }
  }
}
