import { ParseFunction } from './ParseFunction';
import { ParserStrategy } from './ParserStrategy';
import { ArrayParser } from './strategies/Array.parser';
import { IntersectionParser } from './strategies/Intersection.parser';
import { PrimitiveParser } from './strategies/Primitive.parser';
import { TypeLiteralParser } from './strategies/TypeLiteral.parser';
import { TypeAliasParser } from './strategies/TypeReference/TypeAlias.parser';
import { TypeReferenceParser } from './strategies/TypeReference/TypeReference.parser';

const strategies: (new (globalParse: ParseFunction) => ParserStrategy)[] = [
  //
  TypeAliasParser,
  TypeLiteralParser,
  IntersectionParser,
  TypeReferenceParser,
  PrimitiveParser,
  ArrayParser,
];

export const parse: ParseFunction = (...args) => {
  for (const parserConstructor of strategies) {
    const parser = new parserConstructor(parse);
    const result = parser.parse(...args);
    if (result) {
      return result;
    }
  }
};
