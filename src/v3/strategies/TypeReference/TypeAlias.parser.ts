import ts, { SyntaxKind } from 'typescript';
import { ParseFunction, ParseOptions } from '../../ParseFunction';
import { ParserStrategy } from '../../ParserStrategy';
import { ParsedGenericConstraintsMap, ParsedProperty } from '../../types';

export class TypeAliasParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (!ts.isTypeAliasDeclaration(tsNode)) {
      return;
    }

    let hasGenericParameters = false;
    let genericParameterNodes: ts.TypeParameterDeclaration[] | undefined;

    for (const node of tsNode.getChildren()) {
      const nodeText = node.getFullText();

      if (node.kind === SyntaxKind.LessThanToken) {
        hasGenericParameters = true;
        continue;
      }

      if (hasGenericParameters && node.kind === SyntaxKind.SyntaxList) {
        genericParameterNodes = this.findGenericParameters(node);
        continue;
      }
    }

    const parsedGenericConstraints: ParsedGenericConstraintsMap = new Map();

    genericParameterNodes?.forEach((node, parameterIndex) => {
      const nodeText = node.getFullText();

      const parsedGenericConstraint = this.findAndParseGenericConstraint(
        node,
        options,
        parameterIndex
      );
      if (parsedGenericConstraint) {
        const [identifier, parsed] = parsedGenericConstraint;
        parsedGenericConstraints.set(identifier, parsed);
      }
    });

    const optionsWithGenericParameters: ParseOptions = {
      ...options,
      parsedGenericConstraints: new Map(),
    };
    options.parsedGenericConstraints?.forEach((value, key) => {
      optionsWithGenericParameters.parsedGenericConstraints!.set(key, value);
    });
    parsedGenericConstraints.forEach((value, key) => {
      optionsWithGenericParameters.parsedGenericConstraints!.set(key, value);
    });

    const parsedProperties: ParsedProperty[] = [];

    tsNode.forEachChild((typeAliasNode) => {
      const nodeText = typeAliasNode.getFullText();

      if (typeAliasNode.kind === SyntaxKind.ExportKeyword) {
        return;
      }
      if (ts.isIdentifier(typeAliasNode)) {
        return;
      }
      // generic argument already parsed
      if (ts.isTypeParameterDeclaration(typeAliasNode)) {
        return;
      }

      const result = this.globalParse(
        typeAliasNode,
        optionsWithGenericParameters
      );
      if (result) {
        parsedProperties.push(...result);
      }
    });

    if (parsedProperties.length) {
      return parsedProperties;
    }
  };

  private findGenericParameters(syntaxListNode: ts.Node) {
    const genericParameterNodes: ts.TypeParameterDeclaration[] = [];

    for (const parameterNode of syntaxListNode.getChildren()) {
      const nodeText = parameterNode.getFullText();

      if (ts.isTypeParameterDeclaration(parameterNode)) {
        genericParameterNodes.push(parameterNode);
      }
    }

    return genericParameterNodes;
  }

  private findAndParseGenericConstraint(
    genericParameterNode: ts.TypeParameterDeclaration,
    options: ParseOptions,
    parameterIndex: number
  ): [ts.Symbol, ParsedProperty[] | 'generic'] | undefined {
    let identifierSymbol: ts.Symbol | undefined;
    let hasExtendsKeyword = false;
    let constraint: ts.Node | undefined;

    for (const child of genericParameterNode.getChildren()) {
      const nodeText = child.getFullText();

      if (ts.isIdentifier(child)) {
        identifierSymbol = options.typeChecker.getSymbolAtLocation(child);
      } else if (child.kind === SyntaxKind.ExtendsKeyword) {
        hasExtendsKeyword = true;
      } else if (hasExtendsKeyword) {
        constraint = child;
      }
    }

    if (!identifierSymbol) {
      return;
    }

    if (options?.passedGenericConstraintsAsParameterToNestedGeneric) {
      const passedParsedProperty =
        options.passedGenericConstraintsAsParameterToNestedGeneric[
          parameterIndex
        ];

      if (passedParsedProperty) {
        return [identifierSymbol, passedParsedProperty];
      }
    }

    if (constraint) {
      const parsedProperties = this.globalParse(constraint, options);
      if (parsedProperties) {
        return [identifierSymbol, parsedProperties];
      }
    }

    return [identifierSymbol, 'generic'];
  }
}
