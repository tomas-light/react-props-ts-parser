import ts, { SyntaxKind } from 'typescript';
import { defined } from '../../../defined';
import { findImports } from '../../../findImports';
import { getTypeReferenceIdentifier } from '../../../getTypeReferenceIdentifier';
import { getLiteralValues } from '../../../utils/getLiteralValues';
import { ParseFunction, ParseOptions } from '../../ParseFunction';
import { ParserStrategy } from '../../ParserStrategy';
import {
  ParsedGenericConstraints,
  ParsedObject,
  ParsedProperty,
} from '../../types';
import { ArrayParser } from '../Array.parser';

export const UNKNOWN_IDENTIFIER_TEXT = 'unknown_identifier';

export class TypeReferenceParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (!ts.isTypeReferenceNode(tsNode)) {
      return;
    }

    const { typeChecker } = options;

    const identifier = getTypeReferenceIdentifier(tsNode);
    let identifierSymbol: ts.Symbol | undefined;
    if (identifier) {
      identifierSymbol = typeChecker.getSymbolAtLocation(identifier);
    }

    // find parsed generic constraint
    if (
      identifierSymbol &&
      options.parsedGenericConstraints?.has(identifierSymbol)
    ) {
      // it's a generic type
      const genericConstraints =
        options.parsedGenericConstraints!.get(identifierSymbol)!;

      if (genericConstraints === 'generic') {
        const identifierText =
          identifier?.getFullText().trim() ?? UNKNOWN_IDENTIFIER_TEXT;
        return [
          {
            type: 'generic-constraint',
            value: identifierText,
          },
        ] satisfies ParsedProperty[];
      }

      return genericConstraints;
    }

    const typeName = identifierSymbol?.getName();
    if (typeName && ['Array', 'ReadonlyArray'].includes(typeName)) {
      return this.parseNodeAsArray(tsNode, options);
    }

    if (typeName && ['Set', 'Map'].includes(typeName)) {
      return [
        {
          type: 'not-parsed',
          value: debugName.trim(),
        },
      ];
    }

    if (typeName === 'Partial') {
      return this.parsePartialNode(tsNode, options);
    }

    if (typeName === 'Pick') {
      return this.parsePickedNode(tsNode, options);
    }

    if (typeName === 'Omit') {
      return this.parseOmittedNode(tsNode, options);
    }

    const symbolDeclarations = identifierSymbol?.getDeclarations();
    if (symbolDeclarations?.length) {
      const isImport = symbolDeclarations.some(
        (declaration) =>
          ts.isImportSpecifier(declaration) ||
          ts.isImportClause(declaration) ||
          ts.isExternalModuleReference(declaration)
      );
      if (isImport) {
        return this.parseImportedType(
          tsNode,
          options,
          identifier!,
          identifierSymbol!
        );
      }
    }

    // const { tsType, constraint: genericTypeConstraint } =
    //   findNodeGenericConstraint(tsNode, typeChecker);
    //
    // const isGenericConstraint = genericTypeConstraint != null;
    // if (isGenericConstraint) {
    //   const genericParser = new GenericTypeReferenceParser(this.globalParse);
    //   const result = genericParser.parse(tsNode, options);
    //   if (result) {
    //     return result;
    //   }
    // }

    let hasGenericParameters = false;
    let passedParameters: ts.Node[] | undefined;

    for (const node of tsNode.getChildren()) {
      const nodeText = node.getFullText();

      if (node.kind === SyntaxKind.LessThanToken) {
        hasGenericParameters = true;
        continue;
      }

      if (hasGenericParameters && node.kind === SyntaxKind.SyntaxList) {
        passedParameters = this.findPassedParameters(node);
        continue;
      }
    }

    let passedGenericConstraintsAsParameterToNestedGeneric:
      | ParsedGenericConstraints[]
      | undefined;

    if (passedParameters) {
      passedGenericConstraintsAsParameterToNestedGeneric = [];

      passedParameters.forEach((node) => {
        const nodeText = node.getFullText();

        const parsedPropertiesOfParameter = this.globalParse(node, options);
        if (parsedPropertiesOfParameter) {
          passedGenericConstraintsAsParameterToNestedGeneric!.push(
            parsedPropertiesOfParameter
          );
        }
      });
    }

    const nestedOptions: ParseOptions = {
      ...options,
      passedGenericConstraintsAsParameterToNestedGeneric,
    };

    const parsedProperties: ParsedProperty[] = [];

    const tsType = typeChecker.getTypeAtLocation(tsNode);

    const typeDeclarations = findTypeDeclaration(tsType);
    typeDeclarations?.forEach((typeDeclaration) => {
      const typeNode = typeDeclaration.parent;
      if (!typeNode) {
        return;
      }

      const nodeText = typeNode.getFullText();

      const result = this.globalParse(typeNode, nestedOptions);
      if (result) {
        parsedProperties.push(...result);
      }
    });

    if (parsedProperties.length) {
      return parsedProperties;
    }
  };

  private findPassedParameters(syntaxListNode: ts.Node) {
    const passedAsParameterNodes: ts.Node[] = [];

    for (const parameterNode of syntaxListNode.getChildren()) {
      if (parameterNode.kind !== SyntaxKind.CommaToken) {
        passedAsParameterNodes.push(parameterNode);
      }
    }

    return passedAsParameterNodes;
  }

  private parseNodeAsArray(
    tsNode: ts.TypeReferenceNode,
    options: ParseOptions
  ) {
    const arrayParser = new ArrayParser(this.globalParse);
    const result = arrayParser.parseArray(tsNode, options);
    if (result) {
      return result;
    }
    return;
  }

  private parsePartialNode(
    tsNode: ts.TypeReferenceNode,
    options: ParseOptions
  ) {
    const [typeNode] = tsNode.typeArguments ?? [];
    if (!typeNode) {
      return;
    }

    const parsedProperties = this.globalParse(typeNode, options);

    parsedProperties?.forEach((parsedProperty) => {
      if (parsedProperty.type === 'object' && parsedProperty.value) {
        parsedProperty.value.forEach((partialParsedProperty) => {
          partialParsedProperty.optional = true;
        });
      }
    });

    return parsedProperties;
  }

  private parsePickedNode(tsNode: ts.TypeReferenceNode, options: ParseOptions) {
    const [typeNode, pickedNameNode] = tsNode.typeArguments ?? [];
    if (!typeNode || !pickedNameNode) {
      return;
    }

    const parsedProperties = this.globalParse(typeNode, options);
    const picked = new Set(getLiteralValues(pickedNameNode));
    return pickProperties(parsedProperties, { picked });
  }

  private parseOmittedNode(
    tsNode: ts.TypeReferenceNode,
    options: ParseOptions
  ) {
    const [typeNode, omittedNameNode] = tsNode.typeArguments ?? [];
    if (!typeNode || !omittedNameNode) {
      return;
    }

    const parsedProperties = this.globalParse(typeNode, options);
    const omitted = new Set(getLiteralValues(omittedNameNode));
    return pickProperties(parsedProperties, { omitted });
  }

  private parseImportedType(
    tsNode: ts.TypeReferenceNode,
    options: ParseOptions,
    identifier: ts.Identifier,
    identifierSymbol: ts.Symbol
  ): ParsedProperty[] | undefined {
    const { typeChecker } = options;

    const imports = findImports(tsNode.getSourceFile());

    const importedType = imports.find((_import) => {
      const _symbol = typeChecker.getSymbolAtLocation(_import.identifier);
      return _symbol === identifierSymbol;
    });
    if (!importedType) {
      return;
    }

    const isLocalImport = importedType.nameFromWhereImportIs.startsWith('.');
    if (isLocalImport) {
      const tsType = typeChecker.getTypeAtLocation(identifier!);
      const typeDeclarations = (
        tsType.symbol ?? tsType.aliasSymbol
      )?.getDeclarations();

      if (typeDeclarations?.length === 1) {
        return this.globalParse(typeDeclarations[0], options);
      }
    }

    if (importedType.nameFromWhereImportIs === 'react') {
      // if (importedType.identifier.escapedText === 'HTMLAttributes') {
      const tsType = typeChecker.getTypeAtLocation(identifier!);
      const typeDeclarations = (
        tsType.symbol ?? tsType.aliasSymbol
      )?.getDeclarations();

      if (typeDeclarations?.length === 1) {
        return this.globalParse(typeDeclarations[0], options);
      }
      // }
    }

    return [
      {
        type: 'imported-type',
        value: tsNode.getFullText().trim(),
      },
    ];
  }
}

function findTypeDeclaration(tsType: ts.Type) {
  const symbol = tsType.symbol ?? tsType.aliasSymbol;
  if (!symbol) {
    return;
  }

  return symbol.getDeclarations();
}

function pickProperties(
  parsedProperties: ParsedProperty[] | undefined,
  names:
    | {
        picked: Set<string | number | undefined>;
      }
    | {
        omitted: Set<string | number | undefined>;
      }
) {
  if (!parsedProperties) {
    return;
  }

  let expression: (property: ParsedProperty) => boolean;

  if ('picked' in names) {
    expression = (property) => names.picked.has(property.propertyName);
  } else {
    expression = (property) => !names.omitted.has(property.propertyName);
  }

  return parsedProperties
    .map((parsedProperty) => {
      if (parsedProperty.type !== 'object' || !parsedProperty.value) {
        return parsedProperty;
      }

      const parsedObject: ParsedObject = {
        ...parsedProperty,
        value: parsedProperty.value.filter(expression),
      };

      if (!parsedObject.value?.length) {
        return;
      }

      return parsedObject;
    })
    .filter(defined);
}
