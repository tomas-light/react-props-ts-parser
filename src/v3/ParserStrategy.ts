import ts from 'typescript';
import { defined } from '../defined';
import { InternalParseFunction, InternalParseOptions } from './ParseFunction';
import { parsePropertySignature } from './parsePropertySignature';
import { internalSymbol } from './symbols';
import { Cached, NodeId, NodeIdOrText, ParsedProperty } from './types';

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
    argumentsIdentifierSymbols?: NodeIdOrText[];
    propertiesToCache: ParsedProperty[] | undefined;
  }) {
    const {
      identifierSymbol,
      argumentsIdentifierSymbols,
      options,
      propertiesToCache,
    } = config;
    const debugText = identifierSymbol?.getEscapedName();

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
    argumentsIdentifierSymbols?: NodeIdOrText[];
    options: InternalParseOptions;
    propertyToCache: ParsedProperty;
  }): ParsedProperty {
    const {
      identifierSymbol,
      argumentsIdentifierSymbols,
      options,
      propertyToCache,
    } = config;
    const debugText = identifierSymbol?.getEscapedName();

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

    return this.copyCachedProperty(propertyToCache);
  }

  protected findInCache(config: {
    identifierSymbol: NodeId | undefined;
    argumentsIdentifierSymbols?: NodeIdOrText[];
    options: InternalParseOptions;
  }) {
    const { identifierSymbol, argumentsIdentifierSymbols, options } = config;
    const debugText = identifierSymbol?.getEscapedName();

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

    if (!filtered.length) {
      return undefined;
    }

    return this.copyCached(filtered);
  }

  private copyCached(cached: Cached[]): ParsedProperty[] {
    return cached.flatMap((cache) => cache.cached.map(this.copyCachedProperty));
  }

  // copy to prevents "propertyName" and "nodeText" collisions between different using
  private copyCachedProperty(property: ParsedProperty): ParsedProperty {
    switch (property.type) {
      case 'generic-constraint':
        if (typeof property.value === 'string') {
          return { ...property };
        }
        return {
          ...property,
          value: property.value?.slice(),
        };

      case 'union-type':
      case 'array':
      case 'object':
        return {
          ...property,
          value: property.value?.slice(),
        };

      case 'string':
      case 'string-literal':
      case 'number':
      case 'number-literal':
      case 'boolean':
      case 'boolean-literal':
      case 'bigint':
      case 'bigint-literal':
      case 'symbol':
      case 'null':
      case 'undefined':
      case 'any':
      case 'unknown':
      case 'imported-type':
      case 'imported-from-react':
      case 'not-parsed':
      case 'prevented-from-parsing':
      default:
        return { ...property };
    }
  }
}
