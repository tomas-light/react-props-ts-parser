import ts from 'typescript';
import { getTypeReferenceIdentifier } from '../getTypeReferenceIdentifier';
import { ParsedArray, ParsedProperty } from './ParsedProperty';
import { ITypeParser } from './ITypeParser';

export function parseArrayType(
  this: Pick<ITypeParser, 'typeChecker' | 'parseType'>,
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
): boolean {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;
  const arrayNode = tsNode;

  if (!ts.isArrayTypeNode(tsNode)) {
    if (ts.isTypeReferenceNode(tsNode)) {
      const identifier = getTypeReferenceIdentifier(tsNode);

      let identifierSymbol: ts.Symbol | undefined;
      if (identifier) {
        identifierSymbol = this.typeChecker.getSymbolAtLocation(identifier);
      }

      const typeName = identifierSymbol?.getName();
      if (typeName && ['Array', 'ReadonlyArray'].includes(typeName)) {
        // use tsNode as nodeArray
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  const parsedArrayProperty = parsedProperty as ParsedArray;

  parsedArrayProperty.type = 'array';
  parsedArrayProperty.values = [];

  arrayNode.forEachChild((itemNode) => {
    // skip Array or ReadonlyArray identifier
    if (ts.isIdentifier(itemNode)) {
      return;
    }

    const itemProperty = this.parseType({
      tsNode: itemNode,
    });

    parsedArrayProperty.values!.push(itemProperty);
  });

  return true;
}
