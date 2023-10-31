import ts from 'typescript';
import { InternalParseFunction } from './ParseFunction';
import { parseJsDoc } from './strategies/parseJsDoc';
import { internalSymbol } from './symbols';
import { ParsedProperty } from './types';

export function parsePropertySignature(
  parse: InternalParseFunction,
  ...args: Parameters<InternalParseFunction>
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

  // passed generics may be used at several places,
  // we have copy top level to be able to set different propertyNames and so on
  parsedProperties = parsedProperties.map((property) => {
    if (!property[internalSymbol]) {
      return property;
    }

    const { isGenericArgument } = property[internalSymbol];

    const copy: ParsedProperty = {
      ...property,
      [internalSymbol]: {
        ...property[internalSymbol],
      },
    };

    if (isGenericArgument) {
      delete copy[internalSymbol]!.isGenericArgument;
    }

    if (Object.keys(copy[internalSymbol]!).length === 0) {
      delete copy[internalSymbol];
    }

    return copy;
  });

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
