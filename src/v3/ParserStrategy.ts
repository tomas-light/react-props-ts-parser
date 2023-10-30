import ts from 'typescript';
import { defined } from '../defined';
import { InternalParseFunction, InternalParseOptions } from './ParseFunction';
import { parsePropertySignature } from './parsePropertySignature';
import { internalSymbol } from './symbols';
import { Cached, NodeId, ParsedProperty } from './types';

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
    argumentsIdentifierSymbols?: ts.Symbol[];
    propertiesToCache: ParsedProperty[] | undefined;
  }) {
    const {
      identifierSymbol,
      argumentsIdentifierSymbols,
      options,
      propertiesToCache,
    } = config;

    if (!propertiesToCache) {
      return undefined;
    }

    return propertiesToCache
      .map((property) =>
        this.cache({
          identifierSymbol,
          argumentsIdentifierSymbols,
          options,
          propertyToCache: property,
        })
      )
      .filter(defined);
  }

  protected cache(config: {
    identifierSymbol: ts.Symbol | undefined;
    argumentsIdentifierSymbols?: ts.Symbol[];
    options: InternalParseOptions;
    propertyToCache: ParsedProperty;
  }): ParsedProperty {
    const {
      identifierSymbol,
      argumentsIdentifierSymbols,
      options,
      propertyToCache,
    } = config;

    const { nodeCacheMap, passedGenericConstraintsAsParameterToNestedGeneric } =
      options;

    if (!identifierSymbol) {
      return propertyToCache;
    }
    const cached: Cached = {
      cached: [propertyToCache],
    };
    if (argumentsIdentifierSymbols) {
      cached.argumentsSet = new Set(argumentsIdentifierSymbols);
    }

    let cachedProperty = nodeCacheMap.get(identifierSymbol);
    if (!cachedProperty) {
      cachedProperty = [cached];
      nodeCacheMap.set(identifierSymbol, cachedProperty);
    } else {
      cachedProperty.push(cached);
    }

    if (!propertyToCache[internalSymbol]) {
      propertyToCache[internalSymbol] = {};
    }
    propertyToCache[internalSymbol].isCached = true;

    return this.copyCachedProperty(propertyToCache);
  }

  protected findInCache(config: {
    identifierSymbol: NodeId | undefined;
    argumentsIdentifierSymbols?: NodeId[];
    options: InternalParseOptions;
  }) {
    const { identifierSymbol, argumentsIdentifierSymbols, options } = config;

    const cached = options.nodeCacheMap.get(identifierSymbol);
    if (!cached) {
      return undefined;
    }

    if (!argumentsIdentifierSymbols?.length) {
      return this.copyCached(cached);
    }

    const filtered = cached.filter(
      (cache) =>
        argumentsIdentifierSymbols.length === cache.argumentsSet?.size &&
        argumentsIdentifierSymbols.every(
          (symbol) => cache.argumentsSet?.has(symbol)
        )
    );

    return this.copyCached(filtered);
  }

  private copyCached(cached: Cached[]): ParsedProperty[] {
    return cached.flatMap((cache) => cache.cached.map(this.copyCachedProperty));
  }

  private copyCachedProperty(property: ParsedProperty): ParsedProperty {
    // copy to prevents "propertyName" and "nodeText" collisions between different using
    return { ...property };
  }
}
