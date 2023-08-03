import ts from 'typescript';
import { ITypeParser } from './ITypeParser';
import { ParsedProperty } from './ParsedProperty';
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
    if (!typeNode) {
      return false;
    }

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

  if (typeName === 'Pick') {
    const [typeNode, pickedNameNode] = tsNode.typeArguments ?? [];
    if (!typeNode || !pickedNameNode) {
      return false;
    }

    this.parseType({
      tsNode: typeNode,
      parsedProperty,
    });

    if (parsedProperty.type === 'object' && parsedProperty.value) {
      const pickedNames = new Set(getLiteralValues(pickedNameNode));

      const allNames = Object.keys(parsedProperty.value);
      const omittedNames = allNames.filter((name) => !pickedNames.has(name));

      omittedNames.forEach((name) => {
        delete parsedProperty.value![name];
      });
    }

    return true;
  }

  if (typeName === 'Omit') {
    const [typeNode, omittedNameNode] = tsNode.typeArguments ?? [];
    if (!typeNode || !omittedNameNode) {
      return false;
    }

    this.parseType({
      tsNode: typeNode,
      parsedProperty,
    });

    if (parsedProperty.type === 'object' && parsedProperty.value) {
      const omittedNames = getLiteralValues(omittedNameNode);

      omittedNames.forEach((name) => {
        delete parsedProperty.value![name];
      });
    }

    return true;
  }

  return false;
}

function getLiteralValues(typeNode: ts.TypeNode): (string | number)[] {
  const literalNodes: ts.LiteralTypeNode[] = [];

  if (ts.isLiteralTypeNode(typeNode)) {
    literalNodes.push(typeNode);
  } else {
    typeNode!.forEachChild((node) => {
      if (ts.isLiteralTypeNode(node)) {
        literalNodes.push(node);
      } else if (ts.isUnionTypeNode(node)) {
        node.forEachChild((unionNode) => {
          if (ts.isLiteralTypeNode(unionNode)) {
            literalNodes.push(unionNode);
          }
        });
      }
    });
  }

  return literalNodes
    .map((node) => {
      if (ts.isNumericLiteral(node.literal)) {
        return parseInt(node.literal.text, 10);
      }

      if (ts.isStringLiteral(node.literal)) {
        return node.literal.text;
      }
    })
    .filter(Boolean) as (string | number)[];
}
