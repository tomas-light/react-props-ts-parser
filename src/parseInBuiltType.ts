import ts from 'typescript';
import { ITypeParser } from './ITypeParser';
import {
  ObjectParsedProperties,
  ParsedObject,
  ParsedProperty,
} from './ParsedProperty';
import { getTypeReferenceIdentifier } from './getTypeReferenceIdentifier';

export function parseInBuiltType(
  this: Pick<ITypeParser, 'typeChecker' | 'parseType'>,
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
): boolean {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;

  if (!ts.isTypeReferenceNode(tsNode)) {
    return false;
  }

  const identifier = getTypeReferenceIdentifier(tsNode);

  let identifierSymbol: ts.Symbol | undefined;
  if (identifier) {
    identifierSymbol = this.typeChecker.getSymbolAtLocation(identifier);
  }

  const typeName = identifierSymbol?.getName();
  if (typeName && ['Set', 'Map'].includes(typeName)) {
    parsedProperty.type = 'not-parsed';
    parsedProperty.value = tsNode.getFullText().trim();
    return true;
  }

  if (typeName === 'Partial') {
    const typeNode = tsNode.typeArguments?.[0];
    if (typeNode) {
      this.parseType({
        tsNode: typeNode,
        parsedProperty,
      });

      if (parsedProperty.type === 'object' && parsedProperty.value) {
        (Object.values(parsedProperty.value) as ParsedProperty[]).forEach(
          (partialParsedProperty) => {
            partialParsedProperty.optional = true;
          },
        );
      }
      return true;
    }
  }

  if (typeName === 'Pick') {
    // todo:
  }

  if (typeName === 'Omit') {
    // todo:
  }

  return false;
}
