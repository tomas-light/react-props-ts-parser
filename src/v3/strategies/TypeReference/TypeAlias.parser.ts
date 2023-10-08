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
        genericParameterNodes = this.findParameterNodes(node);
      }
    }

    const parsedGenericConstraintsMap: ParsedGenericConstraintsMap = new Map();

    genericParameterNodes?.forEach((genericParameterNode, parameterIndex) => {
      const nodeText = genericParameterNode.getFullText();

      const parsedGenericConstraint = this.findAndParseGenericConstraint(
        genericParameterNode,
        options,
        parameterIndex
      );
      if (parsedGenericConstraint) {
        const [identifier, parsed] = parsedGenericConstraint;
        parsedGenericConstraintsMap.set(identifier, parsed);
      }
    });

    const optionsWithGenericParameters: ParseOptions = {
      ...options,
      parsedGenericConstraintsMap: new Map(),
    };
    options.parsedGenericConstraintsMap?.forEach((value, key) => {
      optionsWithGenericParameters.parsedGenericConstraintsMap!.set(key, value);
    });
    parsedGenericConstraintsMap.forEach((value, key) => {
      optionsWithGenericParameters.parsedGenericConstraintsMap!.set(key, value);
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

  private findParameterNodes(syntaxListNode: ts.Node) {
    const parameterNodes: ts.TypeParameterDeclaration[] = [];

    for (const node of syntaxListNode.getChildren()) {
      const nodeText = node.getFullText();

      if (ts.isTypeParameterDeclaration(node)) {
        parameterNodes.push(node);
      }
    }

    return parameterNodes;
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

    /** Props<Id extends number> {...}
     * to be able to connect "number" constraint to "Id", we use identifier symbol of "Id"
     * if such symbol is undefined - we cannot proceed with this relation
     */
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
