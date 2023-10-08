import ts from 'typescript';
import { ParseFunction } from '../ParseFunction';
import { ParsedProperty } from '../types';
import { parseJsDoc } from './parseJsDoc';

export function parsePropertySignature(
  parse: ParseFunction,
  ...args: Parameters<ParseFunction>
) {
  const [tsNode, options, ...restArgs] = args;
  const debugName = tsNode.getFullText();

  if (!ts.isPropertySignature(tsNode)) {
    return;
  }

  let isOptional = false;
  let propertyName: string | undefined;
  let parsedProperties: ParsedProperty[] | undefined;
  const jsDoc: ParsedProperty['jsDoc'] = parseJsDoc(tsNode, options);

  ts.forEachChild(tsNode, (propertyNode) => {
    const nodeText = propertyNode.getFullText();

    const result = parseJsDoc(propertyNode, options);

    if (ts.isIdentifier(propertyNode)) {
      propertyName = propertyNode.text;
      return;
    }

    if (ts.isQuestionToken(propertyNode)) {
      isOptional = true;
    } else {
      parsedProperties = parse(propertyNode, options, ...restArgs);
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
    if (jsDoc) {
      property.jsDoc ??= jsDoc;
    }
  });

  return parsedProperties;
}
