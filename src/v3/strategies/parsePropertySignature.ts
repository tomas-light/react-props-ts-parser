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
  const jsDoc = parseJsDoc(tsNode, options);

  ts.forEachChild(tsNode, (propertyNode) => {
    const nodeText = propertyNode.getFullText();

    if (ts.isIdentifier(propertyNode)) {
      propertyName = propertyNode.text;
      return;
    }

    /**
     * for cases like:
     * @example
     * interface AriaAttributes {
     *   'aria-activedescendant'?: string | undefined;
     *   ...
     * }
     * */
    if (!propertyName && ts.isLiteralTypeNode(propertyNode)) {
      if (
        ts.isStringLiteral(propertyNode.literal) ||
        ts.isNumericLiteral(propertyNode.literal)
      ) {
        propertyName = propertyNode.literal.text;
        return;
      }
    }
    if (
      !propertyName &&
      (ts.isStringLiteral(propertyNode) || ts.isNumericLiteral(propertyNode))
    ) {
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

      // sanitize extra type "children?: ReactNode | undefined" => "children?: ReactNode"
      // it allows to reduce generated code
      if (
        property.type === 'union-type' &&
        property.value?.some(
          (unionProperty) => unionProperty.type === 'undefined'
        )
      ) {
        const unionWithoutUndefined = property.value!.filter(
          (unionProperty) => unionProperty.type !== 'undefined'
        );
        if (unionWithoutUndefined.length === 1) {
          const [realProperty] = unionWithoutUndefined;

          (property as ParsedProperty).type = realProperty.type;
          (property as ParsedProperty).value = realProperty.value;
        }
      }
    }

    if (jsDoc) {
      property.jsDoc ??= jsDoc;
    }
  });

  return parsedProperties;
}
