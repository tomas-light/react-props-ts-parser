import ts, { SyntaxKind } from 'typescript';
import { defined } from '../../../defined';
import { findImports } from '../../../findImports';
import {
  getTypeReferenceIdentifier,
  getTypeReferenceIdentifierSymbol,
} from '../../../getTypeReferenceIdentifier';
import { getLiteralValues } from '../../../utils/getLiteralValues';
import {
  InternalParseFunction,
  InternalParseOptions,
} from '../../ParseFunction';
import { ParserStrategy } from '../../ParserStrategy';
import {
  NotParsedType,
  ParsedImportedType,
  ParsedObject,
  ParsedProperty,
  ParsedPropertyOrGeneric,
} from '../../types';
import { ArrayParser } from '../Array.parser';
import { markPropertyAsInternalGeneric } from './markPropertyAsInternalGeneric';

export const UNKNOWN_IDENTIFIER_TEXT = 'unknown_identifier';

export class TypeReferenceParser extends ParserStrategy {
  parsePropertyValue: InternalParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (
      !ts.isTypeReferenceNode(tsNode) &&
      !ts.isExpressionWithTypeArguments(tsNode)
    ) {
      return;
    }

    const { typeChecker } = options;

    const identifier = getTypeReferenceIdentifier(tsNode);
    let identifierSymbol: ts.Symbol | undefined;
    if (identifier) {
      identifierSymbol = typeChecker.getSymbolAtLocation(identifier);
    }

    const argumentsIdentifierSymbols = this.findArgumentSymbols(
      tsNode,
      options
    );

    const cached = this.findInCache({
      identifierSymbol,
      options,
      argumentsIdentifierSymbols,
    });
    if (cached) {
      return cached;
    }

    // find parsed generic constraint
    if (
      identifierSymbol &&
      options.parsedGenericConstraintsMap?.has(identifierSymbol)
    ) {
      // it's a generic type
      const constraintParsedPropertyOrGeneric =
        options.parsedGenericConstraintsMap!.get(identifierSymbol)!;

      if (constraintParsedPropertyOrGeneric === 'generic') {
        const identifierText =
          identifier?.getFullText().trim() ?? UNKNOWN_IDENTIFIER_TEXT;
        return [
          {
            type: 'generic-constraint',
            value: identifierText,
          },
        ] satisfies ParsedProperty[];
      }

      return constraintParsedPropertyOrGeneric;
    }

    const typeName = identifierSymbol?.getName();
    if (typeName) {
      if (['Array', 'ReadonlyArray'].includes(typeName)) {
        return this.parseNodeAsArray(tsNode, options);
      }

      if (['Set', 'Map'].includes(typeName)) {
        return [
          {
            type: 'not-parsed',
            value: debugName.trim(),
          },
        ];
      }

      if (typeName === 'Partial') {
        return this.parsePartialNode(tsNode, options, identifierSymbol!);
      }

      if (typeName === 'Pick') {
        return this.parsePickedNode(tsNode, options, identifierSymbol!);
      }

      if (typeName === 'Omit') {
        return this.parseOmittedNode(tsNode, options, identifierSymbol!);
      }
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

    const nodeName = identifierSymbol?.getName();

    if (nodeName) {
      for (const packageName of options.libraryScope.values()) {
        const preventedTypeNames = options.preventFromParsing?.get(packageName);
        if (!preventedTypeNames?.has(nodeName)) {
          continue;
        }

        const property: ParsedImportedType = {
          nodeText: debugName.trim(),
          value: nodeName,
          type: 'imported-type',
          import: {
            type: nodeName,
            moduleName: packageName,
          },
        };

        this.cache({
          options,
          identifierSymbol,
          propertyToCache: property,
        });
        return [property];
      }
    }

    let hasGenericParameters = false;
    let passedParameters: ts.Node[] | undefined;

    for (const node of tsNode.getChildren()) {
      const nodeText = node.getFullText();

      if (node.kind === SyntaxKind.LessThanToken) {
        hasGenericParameters = true;
        continue;
      }

      if (hasGenericParameters && node.kind === SyntaxKind.SyntaxList) {
        passedParameters = this.findPassedParameterNodes(node);
      }
    }

    let passedGenericConstraintsAsParameterToNestedGeneric:
      | ParsedPropertyOrGeneric[]
      | undefined;

    if (passedParameters) {
      passedGenericConstraintsAsParameterToNestedGeneric = [];

      passedParameters.forEach((passedParameterNode) => {
        const nodeText = passedParameterNode.getFullText();

        const parsedParameter = this.globalParse(passedParameterNode, options);
        if (parsedParameter) {
          passedGenericConstraintsAsParameterToNestedGeneric!.push(
            parsedParameter
          );

          parsedParameter.forEach((property) => {
            markPropertyAsInternalGeneric(property);
          });
        }
      });
    }

    const nestedOptions: InternalParseOptions = {
      ...options,
      passedGenericConstraintsAsParameterToNestedGeneric,
    };

    const parsedProperties: ParsedProperty[] = [];

    const tsType = typeChecker.getTypeAtLocation(tsNode);

    const typeDeclarations = findTypeDeclaration(tsType);
    typeDeclarations?.forEach((typeDeclaration) => {
      let node: ts.Node = typeDeclaration;
      const nodeText = typeDeclaration.getFullText();

      if (ts.isTypeLiteralNode(typeDeclaration)) {
        const parentNode = typeDeclaration.parent;
        if (!parentNode) {
          return;
        }

        node = parentNode;
      }

      const nodeText2 = node.getFullText();

      const result = this.globalParse(node, nestedOptions);
      if (options.skipTypeAliasAndInterfaces) {
        result?.forEach((property) => {
          if (property.type === 'prevented-from-parsing') {
            property.value = debugName.trim();
          }
        });
      }

      if (result) {
        parsedProperties.push(...result);
      }
    });

    if (parsedProperties.length) {
      return this.cacheArray({
        identifierSymbol,
        options,
        propertiesToCache: parsedProperties,
      });
    }
  };

  private findPassedParameterNodes(syntaxListNode: ts.Node) {
    const passedNodes: ts.Node[] = [];

    for (const parameterNode of syntaxListNode.getChildren()) {
      // property: Option<Id, Value, SomethingElse, T>;
      // here syntax list is "Id, Value, SomethingElse, T"
      if (parameterNode.kind !== SyntaxKind.CommaToken) {
        passedNodes.push(parameterNode);
      }
    }

    return passedNodes;
  }

  private parseNodeAsArray(
    tsNode: ts.TypeReferenceNode | ts.ExpressionWithTypeArguments,
    options: InternalParseOptions
  ) {
    const debugName = tsNode.getFullText();

    const arrayParser = new ArrayParser(this.globalParse);
    const result = arrayParser.parseArray(tsNode, options);
    if (result) {
      return result;
    }
    return;
  }

  private parsePartialNode(
    tsNode: ts.TypeReferenceNode | ts.ExpressionWithTypeArguments,
    options: InternalParseOptions,
    nodeIdentifierSymbol: ts.Symbol
  ) {
    const debugName = tsNode.getFullText().trim();

    const [typeNode] = tsNode.typeArguments ?? [];
    if (!typeNode) {
      return;
    }

    const parsedProperties = this.globalParse(typeNode, options);
    if (parsedProperties) {
      parsedProperties?.forEach((parsedProperty) => {
        parsedProperty.nodeText = debugName;

        if (parsedProperty.type === 'object' && parsedProperty.value) {
          parsedProperty.value = parsedProperty.value.map(
            (partialParsedProperty) => {
              return {
                ...partialParsedProperty,
                optional: true,
              };
            }
          );
        }
      });

      const argumentsIdentifierSymbols = this.findArgumentSymbols(
        tsNode,
        options
      );

      return this.cacheArray({
        identifierSymbol: nodeIdentifierSymbol,
        options,
        argumentsIdentifierSymbols,
        propertiesToCache: parsedProperties,
      });
    }
  }

  private findArgumentSymbols(
    tsNode: ts.TypeReferenceNode | ts.ExpressionWithTypeArguments,
    options: InternalParseOptions
  ) {
    return tsNode.typeArguments
      ?.map(
        (node) =>
          getTypeReferenceIdentifierSymbol(
            node as ts.TypeReferenceNode,
            options.typeChecker
          ) ?? node.getFullText()
      )
      .filter(defined);
  }

  private parsePickedNode(
    tsNode: ts.TypeReferenceNode | ts.ExpressionWithTypeArguments,
    options: InternalParseOptions,
    nodeIdentifierSymbol: ts.Symbol
  ) {
    const debugName = tsNode.getFullText().trim();

    const [typeNode, pickedNameNode] = tsNode.typeArguments ?? [];
    if (!typeNode || !pickedNameNode) {
      return;
    }

    const parsedProperties = this.globalParse(typeNode, options);
    const picked = new Set(getLiteralValues(pickedNameNode));
    const properties = pickProperties(parsedProperties, { picked });
    if (properties) {
      properties.forEach((property) => {
        property.nodeText = debugName;
      });

      const argumentsIdentifierSymbols = this.findArgumentSymbols(
        tsNode,
        options
      );

      return this.cacheArray({
        identifierSymbol: nodeIdentifierSymbol,
        options,
        argumentsIdentifierSymbols,
        propertiesToCache: properties,
      });
    }
  }

  private parseOmittedNode(
    tsNode: ts.TypeReferenceNode | ts.ExpressionWithTypeArguments,
    options: InternalParseOptions,
    nodeIdentifierSymbol: ts.Symbol
  ) {
    const debugName = tsNode.getFullText().trim();

    const [typeNode, omittedNameNode] = tsNode.typeArguments ?? [];
    if (!typeNode || !omittedNameNode) {
      return;
    }

    const parsedProperties = this.globalParse(typeNode, options);
    const omitted = new Set(getLiteralValues(omittedNameNode));
    const properties = pickProperties(parsedProperties, { omitted });
    if (properties) {
      properties.forEach((property) => {
        property.nodeText = debugName;
      });

      const argumentsIdentifierSymbols = this.findArgumentSymbols(
        tsNode,
        options
      );

      return this.cacheArray({
        identifierSymbol: nodeIdentifierSymbol,
        options,
        argumentsIdentifierSymbols,
        propertiesToCache: properties,
      });
    }
  }

  private parseImportedType(
    tsNode: ts.TypeReferenceNode | ts.ExpressionWithTypeArguments,
    options: InternalParseOptions,
    identifier: ts.Identifier,
    identifierSymbol: ts.Symbol
  ): ParsedProperty[] | undefined {
    const debugName = tsNode.getFullText().trim();

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
        const properties = this.globalParse(typeDeclarations[0], options);
        if (properties) {
          properties.forEach((property) => {
            property.nodeText = debugName;
          });
        }
        return properties;
      }
    }

    const nodeName = identifierSymbol.getName();

    const importedProperty: ParsedImportedType = {
      type: 'imported-type',
      import: {
        type: nodeName,
        moduleName: importedType.nameFromWhereImportIs,
      },
      nodeText: tsNode.getFullText().trim(),
      value: nodeName,
    };

    if (importedType.nameFromWhereImportIs === 'react') {
      if (options.preventFromParsing?.get('react')?.has(nodeName)) {
        this.cache({
          options,
          identifierSymbol,
          propertyToCache: importedProperty,
        });
        return [importedProperty];
      }

      const tsType = typeChecker.getTypeAtLocation(identifier);
      const typeDeclarations = (
        tsType.symbol ?? tsType.aliasSymbol
      )?.getDeclarations();

      if (typeDeclarations?.length === 1) {
        const parsedProperties = this.globalParse(typeDeclarations[0], {
          ...options,
          skipTypeAliasAndInterfaces: true,
          libraryScope: new Set(options.libraryScope).add(
            importedType.nameFromWhereImportIs
          ),
        });

        if (parsedProperties) {
          parsedProperties.forEach((property) => {
            property.nodeText = debugName;
            property.import = {
              type: nodeName,
              moduleName: importedType.nameFromWhereImportIs,
            };
          });
        }

        return parsedProperties;
      }
    }

    this.cache({
      options,
      identifierSymbol,
      propertyToCache: importedProperty,
    });
    return [importedProperty];
  }
}

function findTypeDeclaration(tsType: ts.Type) {
  // using of ".symbol" leads us to literal declaration for simple type aliases, so we have to navigate to parent
  // node to parse it correctly, but aliasSymbol leads us to the correct node at the start
  // but interfaces have only symbol
  const symbol = tsType.aliasSymbol ?? tsType.symbol;
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
