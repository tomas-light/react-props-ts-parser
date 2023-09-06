import ts from 'typescript';
import { getTypeReferenceIdentifierSymbol } from '../../../getTypeReferenceIdentifier';
import { ParseFunction } from '../../ParseFunction';
import { ParserStrategy } from '../../ParserStrategy';
import { ParsedProperty } from '../../types';
import { ArrayParser } from '../Array.parser';
import {
  findNodeGenericConstraint,
  GenericTypeReferenceParser,
} from './GenericTypeReference.parser';

export class TypeReferenceParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (!ts.isTypeReferenceNode(tsNode)) {
      return;
    }

    const { typeChecker } = options;

    const identifierSymbol = getTypeReferenceIdentifierSymbol(
      tsNode,
      typeChecker
    );

    const typeName = identifierSymbol?.getName();
    if (typeName && ['Array', 'ReadonlyArray'].includes(typeName)) {
      const arrayParser = new ArrayParser(this.globalParse);
      const result = arrayParser.parseArray(tsNode, options);
      if (result) {
        return result;
      }
      return;
    }

    const { tsType, constraint: genericTypeConstraint } =
      findNodeGenericConstraint(tsNode, typeChecker);

    const isGenericConstraint = genericTypeConstraint != null;
    if (isGenericConstraint) {
      const genericParser = new GenericTypeReferenceParser(this.globalParse);
      const result = genericParser.parse(tsNode, options);
      if (result) {
        return result;
      }
    }

    const parsedProperties: ParsedProperty[] = [];

    const typeDeclarations = findTypeDeclaration(tsType);
    typeDeclarations?.forEach((typeDeclaration) => {
      const result = this.globalParse(typeDeclaration, options);
      if (result) {
        parsedProperties.push(...result);
      }
    });

    if (parsedProperties.length) {
      return parsedProperties;
    }
  };
}

function findTypeDeclaration(tsType: ts.Type) {
  const symbol = tsType.symbol ?? tsType.aliasSymbol;
  if (!symbol) {
    return;
  }

  return symbol.getDeclarations();
}
