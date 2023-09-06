import ts from 'typescript';
import { ParseFunction } from '../ParseFunction';
import { ParsedProperty } from '../types';

export function parsePropertySignature(
  parse: ParseFunction,
  ...args: Parameters<ParseFunction>
) {
  const [tsNode, ...restArgs] = args;
  const debugName = tsNode.getFullText();

  if (!ts.isPropertySignature(tsNode)) {
    return;
  }

  let isOptional = false;
  let propertyName: string | undefined;
  let parsedProperties: ParsedProperty[] | undefined;

  ts.forEachChild(tsNode, (propertyNode) => {
    if (ts.isIdentifier(propertyNode)) {
      propertyName = propertyNode.text;
      return;
    }

    if (ts.isQuestionToken(propertyNode)) {
      isOptional = true;
    } else {
      parsedProperties = parse(propertyNode, ...restArgs);
    }
  });

  if (!parsedProperties) {
    return;
  }

  parsedProperties.forEach((property) => {
    property.propertyName ??= propertyName;
    if (isOptional) {
      property.optional = true;
    }
  });

  return parsedProperties;
}
