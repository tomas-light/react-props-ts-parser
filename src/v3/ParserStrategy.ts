import ts from 'typescript';
import { InternalParseFunction, InternalParseOptions } from './ParseFunction';
import { parsePropertySignature } from './parsePropertySignature';
import { internalSymbol } from './symbols';
import { ParsedProperty } from './types';

export abstract class ParserStrategy {
  constructor(protected readonly globalParse: InternalParseFunction) {}

  parse: InternalParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (ts.isPropertySignature(tsNode)) {
      return parsePropertySignature(this.parsePropertyValue, tsNode, options);
    }

    const parsedProperties = this.parsePropertyValue(tsNode, options);
    if (parsedProperties?.length) {
      return parsedProperties;
    }
  };

  abstract parsePropertyValue: InternalParseFunction;

  protected cacheArray(config: {
    options: InternalParseOptions;
    identifierSymbol: ts.Symbol | undefined;
    propertyToCache: ParsedProperty[] | undefined;
  }) {
    const { identifierSymbol, options, propertyToCache } = config;

    if (!propertyToCache) {
      return undefined;
    }

    if (propertyToCache.length === 1) {
      const [singleProperty] = propertyToCache;
      return [
        this.cache({
          options,
          identifierSymbol,
          propertyToCache: singleProperty,
        }),
      ];
    }

    // how to bind many properties to single identifier ?
    console.warn('cannot cache array');
    return propertyToCache;
  }

  protected cache<T extends ParsedProperty>(config: {
    options: InternalParseOptions;
    identifierSymbol: ts.Symbol | undefined;
    propertyToCache: T;
  }): T {
    const { identifierSymbol, options, propertyToCache } = config;

    const {
      cachedParsedMap,
      passedGenericConstraintsAsParameterToNestedGeneric,
    } = options;

    if (!identifierSymbol) {
      return propertyToCache;
    }

    const cachedProperty = cachedParsedMap.get(identifierSymbol);
    if (!cachedProperty) {
      cachedParsedMap.set(identifierSymbol, propertyToCache);

      if (!propertyToCache[internalSymbol]) {
        propertyToCache[internalSymbol] = {};
      }
      propertyToCache[internalSymbol].isCached = true;
    }

    return propertyToCache;
  }

  protected getFromCache(
    options: InternalParseOptions,
    identifierSymbol: ts.Symbol | undefined
  ) {
    const cachedProperty = options.cachedParsedMap.get(identifierSymbol);
    if (cachedProperty) {
      // copy to prevents "propertyName" and "nodeText" collisions between different using
      return [{ ...cachedProperty } as ParsedProperty];
    }
  }
}
