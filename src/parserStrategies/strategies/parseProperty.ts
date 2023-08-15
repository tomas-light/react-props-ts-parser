import ts from 'typescript';
import { ParserStrategy } from '../ParserStrategy';

export const parseProperty = (
  parse: ParserStrategy['parse'],
  ...args: Parameters<ParserStrategy['parse']>
) => {
  const [tsNode, ...restArgs] = args;
  const debugName = tsNode.getFullText();

  let isOptional = false;

  let parsedProperties: ReturnType<typeof parse>;

  if (ts.isPropertySignature(tsNode)) {
    ts.forEachChild(tsNode, (propertyNode) => {
      if (ts.isIdentifier(propertyNode)) {
        return;
      }

      if (ts.isQuestionToken(propertyNode)) {
        isOptional = true;
      } else {
        parsedProperties = parse(propertyNode, ...restArgs);
      }
    });
  } else {
    parsedProperties = parse(tsNode, ...restArgs);
  }

  if (isOptional) {
    parsedProperties?.forEach((parsed) => {
      parsed.optional = true;
    });
  }

  return parsedProperties;
};
