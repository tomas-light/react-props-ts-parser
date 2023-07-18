import ts from 'typescript';

export interface ParsedPropertyDescriptor<
  Type extends string,
  Value = never,
  Values = never,
> {
  type: Type;
  optional?: boolean;
  value?: Value;
  values?: Values extends never ? never : Values[];
}

export interface ParsedString extends ParsedPropertyDescriptor<'string'> {}
export interface ParsedNumber extends ParsedPropertyDescriptor<'number'> {}
export interface ParsedBoolean extends ParsedPropertyDescriptor<'boolean'> {}
export interface ParsedUndefined
  extends ParsedPropertyDescriptor<'undefined'> {}
export interface ParsedSymbol extends ParsedPropertyDescriptor<'symbol'> {}
export interface ParsedBigint extends ParsedPropertyDescriptor<'bigint'> {}
export interface ParsedNull extends ParsedPropertyDescriptor<'null'> {}
export interface ParsedFunction extends ParsedPropertyDescriptor<'function'> {}

export interface ParsedStringLiteral
  extends ParsedPropertyDescriptor<'string-literal', string> {}

export interface ParsedNumberLiteral
  extends ParsedPropertyDescriptor<'number-literal', number> {}

export interface ParsedUnionType
  extends ParsedPropertyDescriptor<'union-type', never, ParsedProperty> {}

export interface ParsedArray
  extends ParsedPropertyDescriptor<'array', never, ParsedProperty> {}

export interface ParsedObject
  extends ParsedPropertyDescriptor<
    'object',
    { [propertyName: string]: ParsedProperty }
  > {}

export interface NotParsedType
  extends ParsedPropertyDescriptor<'not-parsed', string> {}

export type ParsedProperty =
  | ParsedString
  | ParsedNumber
  | ParsedBoolean
  | ParsedUndefined
  | ParsedSymbol
  | ParsedBigint
  | ParsedNull
  | ParsedFunction
  | ParsedStringLiteral
  | ParsedNumberLiteral
  | ParsedUnionType
  | ParsedArray
  | ParsedObject
  | NotParsedType;

export class TypeParser {
  constructor(
    private readonly typeChecker: ts.TypeChecker,
    private readonly properties: {
      [propertyName: string]: ParsedProperty;
    } = {},
  ) {}

  parse(
    name: string,
    tsNode: ts.Node,
    typeArguments?: ts.NodeArray<ts.TypeNode>,
  ) {
    tsNode.forEachChild((childNode) => {
      if (!ts.isPropertySignature(childNode)) {
        // what is it?
        debugger;
        return;
      }

      const { propertyName, parsedProperty } = this.parsePropertySignatureNode(
        name,
        childNode,
        typeArguments,
      );

      if (propertyName && parsedProperty) {
        this.properties[propertyName] = parsedProperty;
      }
    });

    return this.properties;
  }

  parsePropertySignatureNode(
    name: string,
    tsNode: ts.Node,
    typeArguments?: ts.NodeArray<ts.TypeNode>,
  ) {
    let propertyName: string | undefined;
    let parsedProperty: ParsedProperty | undefined;

    // property has at least those children: identifier and its value
    tsNode.forEachChild((grandChildNode) => {
      if (ts.isIdentifier(grandChildNode)) {
        propertyName = grandChildNode.text;
        return;
      }

      parsedProperty = this.createDescriptorForNode(
        parsedProperty,
        propertyName ?? '<3>',
        grandChildNode,
        typeArguments,
      );
    });

    return {
      propertyName,
      parsedProperty,
    };
  }

  private createDescriptorForNode(
    // it is required in cases when you process optional properties: QuestionToken will be adjusted to existed property descriptor instead of overriding it
    parsedProperty: ParsedProperty | undefined,
    name: string,
    tsNode: ts.Node,
    typeArguments?: ts.NodeArray<ts.TypeNode>,
  ) {
    if (!parsedProperty) {
      parsedProperty = {} as ParsedProperty;
    }

    if (this.handlePrimitiveProperty(name, tsNode, parsedProperty)) {
      //
    } else if (this.handleLiteralProperty(name, tsNode, parsedProperty)) {
      //
    } else if (this.handleUnionType(name, tsNode, parsedProperty)) {
      //
    } else if (this.handleArrayType(name, tsNode, parsedProperty)) {
      //
    } else if (
      this.handleReferenceType(name, tsNode, parsedProperty, typeArguments)
    ) {
      //
    } else if (this.handleOptionalProperty(name, tsNode, parsedProperty)) {
      //
    } else {
      parsedProperty.type = 'not-parsed';
      parsedProperty.value = tsNode.getFullText().trim();
    }
    return parsedProperty;
  }

  private handlePrimitiveProperty(
    name: string,
    tsNode: ts.Node,
    parsedProperty: ParsedProperty,
  ) {
    if (tsNode.kind === ts.SyntaxKind.NumberKeyword) {
      parsedProperty.type = 'number';
      return true;
    }
    if (tsNode.kind === ts.SyntaxKind.BooleanKeyword) {
      parsedProperty.type = 'boolean';
      return true;
    }
    if (tsNode.kind === ts.SyntaxKind.StringKeyword) {
      parsedProperty.type = 'string';
      return true;
    }
    if (tsNode.kind === ts.SyntaxKind.UndefinedKeyword) {
      parsedProperty.type = 'undefined';
      return true;
    }
    if (tsNode.kind === ts.SyntaxKind.NullKeyword) {
      parsedProperty.type = 'null';
      return true;
    }
    if (tsNode.kind === ts.SyntaxKind.SymbolKeyword) {
      parsedProperty.type = 'symbol';
      return true;
    }
    if (tsNode.kind === ts.SyntaxKind.BigIntLiteral) {
      parsedProperty.type = 'bigint';
      return true;
    }
    if (ts.isFunctionTypeNode(tsNode)) {
      parsedProperty.type = 'function';
      return true;
    }
    return false;
  }

  private handleLiteralProperty(
    name: string,
    tsNode: ts.Node,
    parsedProperty: ParsedProperty,
  ) {
    if (ts.isLiteralTypeNode(tsNode)) {
      return handleLiterals(tsNode.literal);
    }

    return handleLiterals(tsNode);

    function handleLiterals(tsNode: ts.Node) {
      if (ts.isNumericLiteral(tsNode)) {
        parsedProperty.type = 'number-literal';
        (parsedProperty as ParsedNumberLiteral).value = parseInt(
          tsNode.text,
          10,
        );
        return true;
      }

      if (ts.isStringLiteral(tsNode)) {
        parsedProperty.type = 'string-literal';
        (parsedProperty as ParsedStringLiteral).value = tsNode.text;
        return true;
      }

      return false;
    }
  }

  private handleUnionType(
    name: string,
    tsNode: ts.Node,
    parsedProperty: ParsedProperty,
  ) {
    if (ts.isUnionTypeNode(tsNode)) {
      parsedProperty.type = 'union-type';
      parsedProperty.values = [];

      tsNode.forEachChild((unionTypeNode) => {
        const unionProperty = this.createDescriptorForNode(
          undefined,
          name,
          unionTypeNode,
        );
        (parsedProperty as ParsedUnionType).values!.push(unionProperty as any);
      });

      return true;
    }
    return false;
  }

  private handleArrayType(
    name: string,
    tsNode: ts.Node,
    parsedProperty: ParsedProperty,
  ) {
    if (ts.isArrayTypeNode(tsNode)) {
      parsedProperty.type = 'array';
      parsedProperty.values = [];

      tsNode.forEachChild((itemNode) => {
        const itemProperty = this.createDescriptorForNode(
          undefined,
          name,
          itemNode,
        );
        (parsedProperty as ParsedUnionType).values!.push(itemProperty as any);
      });

      return true;
    }
    return false;
  }

  private handleOptionalProperty(
    name: string,
    tsNode: ts.Node,
    parsedProperty: ParsedProperty,
  ) {
    if (ts.isQuestionToken(tsNode)) {
      parsedProperty.optional = true;
      return true;
    }
    return false;
  }

  // todo: WIP
  private handleReferenceType(
    name: string,
    tsNode: ts.Node,
    parsedProperty: ParsedProperty,
    typeArguments?: ts.NodeArray<ts.TypeNode>,
  ) {
    if (!ts.isTypeReferenceNode(tsNode)) {
      return false;
    }

    const type = this.typeChecker.getTypeAtLocation(tsNode);

    if (this.handleMappedType(parsedProperty, type, tsNode, typeArguments)) {
      return true;
    } else if (
      this.handleGenericPropertyWithArgumentInReferencedType(
        parsedProperty,
        type,
        typeArguments,
      )
    ) {
      return true;
    }

    return this.handleGenericProperty(parsedProperty, type, tsNode);
  }

  private getTypeProperties(type: ts.Type) {
    const properties = type.getProperties();
    const apparentProperties = type.getApparentProperties();
    const joinedProperties = properties.concat(apparentProperties);
    return joinedProperties.filter(
      (sym, index) => joinedProperties.indexOf(sym) === index,
    );
  }

  /**
   * @example
   * type MyGeneric<T> = {
   *   myProp: T; // <-- here we go (param 'type' === MyGeneric)
   * };
   *
   * type TypeToParse = {
   *   someProp: MyGeneric<string>;
   * };
   * */
  private handleGenericPropertyWithArgumentInReferencedType(
    parsedProperty: ParsedProperty,
    type: ts.Type,
    typeArguments?: ts.NodeArray<ts.TypeNode>,
  ) {
    const properties = this.getTypeProperties(type);

    if (properties.length !== 0) {
      return false;
    }

    const symbol = type.symbol ?? type.aliasSymbol;
    if (!symbol) {
      return false;
    }

    const declarations = symbol.getDeclarations();
    if (!declarations?.length || declarations.length > 1) {
      // can be more than one? what should we do?
      return false;
    }

    const [declaration] = declarations;
    if (!ts.isTypeParameterDeclaration(declaration) || !typeArguments) {
      // what's here?
      return false;
    }

    if (
      !ts.isInterfaceDeclaration(declaration.parent) &&
      !ts.isTypeAliasDeclaration(declaration.parent) &&
      !ts.isJSDocTemplateTag(declaration.parent)
    ) {
      // has no typeParameters field
      return false;
    }

    const genericParameterPosition =
      declaration.parent.typeParameters?.findIndex(
        (parameter) => parameter.name === declaration.name,
      );
    if (genericParameterPosition == null) {
      // wrong type
      return;
    }

    const argument = typeArguments.at(genericParameterPosition);
    if (argument) {
      this.createDescriptorForNode(
        parsedProperty,
        declaration.name.escapedText ?? '<1>',
        argument,
        typeArguments,
      );

      return true;
    }

    return true;
  }

  /**
   * @example
   * type MyGeneric<T> = {
   *   myProp: T;
   * };
   *
   * type TypeToParse = {
   *   someProp: MyGeneric<string>; // <-- here we go (param 'type' === MyGeneric)
   * };
   * */
  private handleGenericProperty(
    parsedProperty: ParsedProperty,
    type: ts.Type,
    tsReferenceNode: ts.TypeReferenceNode,
  ) {
    const properties = this.getTypeProperties(type);
    if (!properties.length) {
      return false;
    }

    parsedProperty.type = 'object';
    parsedProperty.value = {};

    for (const propertySymbol of properties) {
      if (propertySymbol.valueDeclaration) {
        const { propertyName, parsedProperty: nestedProperty } =
          this.parsePropertySignatureNode(
            propertySymbol.name ?? '<2>',
            propertySymbol.valueDeclaration,
            tsReferenceNode.typeArguments,
          );

        if (propertyName && nestedProperty) {
          parsedProperty[propertyName as keyof ParsedProperty] =
            nestedProperty as never;
        }
      }
    }

    return true;
  }

  /**
   * @example
   * type Props = {
   *  classes: Record<string, string>; <---- node
   * }
   * type Record<K extends keyof any, T> = { <---- type
   *   [P in K]: T; <---- declaration/mappedTypeNode
   * };
   * */
  private handleMappedType(
    parsedProperty: ParsedProperty,
    type: ts.Type,
    tsReferenceNode: ts.TypeReferenceNode,
    typeArguments?: ts.NodeArray<ts.TypeNode>,
  ) {
    const { declaration } = type as unknown as { declaration?: ts.Node };
    if (!declaration || !ts.isMappedTypeNode(declaration)) {
      return false;
    }

    parsedProperty.type = 'not-parsed';
    parsedProperty.value = tsReferenceNode.getFullText().trim();

    // const names: string[] = [];
    //
    // // mappedTypeNode.typeParameter.symbol === type.typeParameter.symbol
    //
    // const mappedTypeNode = declaration;
    // const mappedTypeNodeTypeParameter = mappedTypeNode.typeParameter; // "P" in "P in K"
    // const passedTypeArguments = typeArguments || tsReferenceNode.typeArguments;
    // // const typeAliasTypeParameters = ;
    //
    // // const index = typeAliasTypeParameters.findIndex(declaredParameter => declaredParameter.);
    // const index = -1;
    // const argument = passedTypeArguments?.at(index);
    //
    // if (argument) {
    //   const text = argument.getText();
    //   names.push(text);
    // }
    //
    // mappedTypeNode.forEachChild((mappedNode) => {
    //   const parameterOrValue = mappedNode;
    //
    //   // if (ts.isTypeParameterDeclaration(parameterOrValue)) {
    //   //   const passedTypeArguments = (typeArguments || node.typeArguments);
    //   //   // const typeAliasTypeParameters = ;
    //   //
    //   //   // const index = typeAliasTypeParameters.findIndex(declaredParameter => declaredParameter.);
    //   //   const index = -1;
    //   //   const argument = passedTypeArguments?.at(index);
    //   //
    //   //   if (argument) {
    //   //     const text = argument.getText();
    //   //     names.push(text);
    //   //   }
    //   //   return;
    //   // }
    //
    //   if (ts.isTypeReferenceNode(parameterOrValue)) {
    //     const a = 1;
    //   }
    // });
    //
    // // names.forEach((name) => {
    // //   parsedProperty.value[name] = valueDescriptor;
    // // });
    return true;
  }
}
