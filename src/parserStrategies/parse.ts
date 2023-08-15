import { ParserStrategy } from './ParserStrategy';
import { ArrayParser } from './strategies/Array.parser';
import { PrimitiveParser } from './strategies/Primitive.parser';

const strategies: ParserStrategy[] = [
  //
  PrimitiveParser,
  ArrayParser,
];

export const parse: ParserStrategy['parse'] = (...args) => {
  for (const parserConstructor of strategies) {
    const parser = new parserConstructor(parse);
    const result = parser.parse(...args);
    if (result) {
      return result;
    }
  }
};
