import { InternalParseFunction, ParseFunction } from './ParseFunction';
import { ArrayParser } from './strategies/Array.parser';
import { IntersectionParser } from './strategies/Intersection.parser';
import { LiteralParser } from './strategies/Literal.parser';
import { PrimitiveParser } from './strategies/Primitive.parser';
import { TypeLiteralParser } from './strategies/TypeLiteral.parser';
import { InterfaceParser } from './strategies/TypeReference/Interface.parser';
import { TypeAliasParser } from './strategies/TypeReference/TypeAlias.parser';
import { TypeReferenceParser } from './strategies/TypeReference/TypeReference.parser';
import { UnionTypeParser } from './strategies/UnionType.parser';
import { ParsedProperty } from './types';

const strategies = [
  //
  InterfaceParser,
  TypeAliasParser,
  TypeLiteralParser,
  IntersectionParser,
  TypeReferenceParser,
  PrimitiveParser,
  LiteralParser,
  ArrayParser,
  UnionTypeParser,
] as const;

export const parse: ParseFunction = (
  tsNode,
  options
): ParsedProperty[] | undefined => {
  return parseInternal(tsNode, {
    ...options,
    nodeCacheMap: options.nodeCacheMap ?? new Map(),
    libraryScope: new Set(),
    preventFromParsing: Object.entries(options.preventFromParsing ?? {}).reduce(
      (map, [packageName, typeNames]) => {
        let set = map.get(packageName);
        if (!set) {
          set = new Set<string>();
          map.set(packageName, set);
        }

        typeNames.forEach((typeName) => {
          set?.add(typeName);
        });

        return map;
      },
      new Map<string, Set<string>>()
    ),
  });
};

export const parseInternal: InternalParseFunction = (
  tsNode,
  options
): ParsedProperty[] | undefined => {
  const debugName = tsNode.getFullText();

  for (const parserConstructor of strategies) {
    const parser = new parserConstructor(parseInternal);
    const result = parser.parse(tsNode, options);
    if (result) {
      return result;
    }
  }
};
