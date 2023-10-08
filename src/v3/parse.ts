import { ParseFunction } from './ParseFunction';
import { ParserStrategy } from './ParserStrategy';
import { ArrayParser } from './strategies/Array.parser';
import { IntersectionParser } from './strategies/Intersection.parser';
import { LiteralParser } from './strategies/Literal.parser';
import { PrimitiveParser } from './strategies/Primitive.parser';
import { TypeLiteralParser } from './strategies/TypeLiteral.parser';
import { InterfaceParser } from './strategies/TypeReference/Interface.parser';
import { TypeAliasParser } from './strategies/TypeReference/TypeAlias.parser';
import { TypeReferenceParser } from './strategies/TypeReference/TypeReference.parser';
import { UnionTypeParser } from './strategies/UnionType.parser';

const strategies: (new (globalParse: ParseFunction) => ParserStrategy)[] = [
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
];

export const parse: ParseFunction = (...args) => {
  const [tsNode] = args;
  const debugName = tsNode.getFullText();

  for (const parserConstructor of strategies) {
    const parser = new parserConstructor(parse);
    const result = parser.parse(...args);
    if (result) {
      return result;
    }
  }
};
