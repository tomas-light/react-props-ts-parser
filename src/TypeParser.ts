import ts from 'typescript';
import { parseArrayType } from './parseArrayType';
import { ParsedProperty } from './ParsedProperty';
import { parseLiteralType } from './parseLiteralType';
import { parsePrimitiveType } from './parsePrimitiveType';
import { parseTypeAlias } from './parseTypeAlias';
import { parseUnionType } from './parseUnionType';

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
      let propertyName: string | undefined;
      let parsedProperty: ParsedProperty | undefined;

      if (ts.isPropertySignature(childNode)) {
        ({ propertyName, parsedProperty } = this.parsePropertySignatureNode(
          name,
          childNode,
          typeArguments,
        ));
      } else if (ts.isTypeLiteralNode(childNode)) {
        this.parse(childNode.getFullText(), childNode);
      } else {
        parsedProperty = this.parseType({
          debugName: childNode.getFullText(),
          tsNode: childNode,
          typeArguments,
        });
      }

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

      parsedProperty = this.parseType({
        parsedProperty,
        debugName: tsNode.getFullText(),
        tsNode: grandChildNode,
        typeArguments,
      });
    });

    const nodeWithJsDoc = tsNode as unknown as { jsDoc: ts.NodeArray<ts.Node> };

    if (
      parsedProperty &&
      Array.isArray(nodeWithJsDoc.jsDoc) &&
      nodeWithJsDoc.jsDoc.length > 0
    ) {
      const [firstJsDocNode] = nodeWithJsDoc.jsDoc;
      parsedProperty.jsDoc = {
        comment: firstJsDocNode.comment,
        fullText: firstJsDocNode.getFullText(),
      };
      // parsedProperty.jsDoc = nodeWithJsDoc.jsDoc
      //   .map((node) => node.getFullText())
      //   .join('\n');
    }

    return {
      propertyName,
      parsedProperty,
    };
  }

  parseType(params: {
    debugName: string;
    tsNode: ts.Node;
    // it is required in cases when you process optional properties: QuestionToken will be adjusted to existed property descriptor instead of overriding it
    parsedProperty?: ParsedProperty;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  }) {
    const {
      debugName,
      tsNode,
      parsedProperty = {} as ParsedProperty,
      typeArguments,
    } = params;

    if (parsePrimitiveType({ debugName, tsNode, parsedProperty })) {
      //
    } else if (parseLiteralType({ debugName, tsNode, parsedProperty })) {
      //
    } else if (
      parseUnionType.call(this, { debugName, tsNode, parsedProperty })
    ) {
      //
    } else if (
      parseArrayType.call(this, { debugName, tsNode, parsedProperty })
    ) {
      //
    } else if (
      this.handleReferenceType(debugName, tsNode, parsedProperty, typeArguments)
    ) {
      //
    } else if (
      this.handleQuestionToken({ debugName, tsNode, parsedProperty })
    ) {
      //
    } else if (
      parseTypeAlias.call(this, { debugName, tsNode, parsedProperty })
    ) {
      //
    } else {
      parsedProperty.type = 'not-parsed';
      parsedProperty.value = tsNode.getFullText().trim();
    }

    return parsedProperty;
  }

  private handleQuestionToken(params: {
    debugName: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  }): boolean {
    const { tsNode, parsedProperty, debugName } = params;

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

    if (this.handleImportedTypes(name, parsedProperty, tsNode, typeArguments)) {
      return true;
    } else if (
      this.handleMappedType(name, parsedProperty, tsNode, typeArguments)
    ) {
      return true;
    } else if (
      this.handleGenericPropertyWithArgumentInReferencedType(
        name,
        parsedProperty,
        tsNode,
        typeArguments ?? tsNode.typeArguments,
      )
    ) {
      return true;
    } else if (this.handleGenericProperty(name, parsedProperty, tsNode)) {
      return true;
    }

    return false;
  }

  // private findImports() {
  //   const imports: {
  //     identifier: ts.Identifier;
  //     nameFromWhereImportIs: string;
  //   }[] = [];
  //
  //   ts.forEachChild(this.sourceFile, (node) => {
  //     if (ts.isImportDeclaration(node)) {
  //       let nameFromWhereImportIs: string | undefined;
  //       const identifiers: ts.Identifier[] = [];
  //
  //       node.forEachChild((importNode) => {
  //         if (ts.isStringLiteral(importNode)) {
  //           nameFromWhereImportIs = importNode.getFullText();
  //         } else if (ts.isImportClause(importNode)) {
  //           importNode.forEachChild((importClauseNode) => {
  //             if (ts.isIdentifier(importClauseNode)) {
  //               identifiers.push(importClauseNode);
  //             } else if (ts.isNamedImports(importClauseNode)) {
  //               importClauseNode.forEachChild((namedImportNode) => {
  //                 if (ts.isImportSpecifier(namedImportNode)) {
  //                   namedImportNode.forEachChild((importSpecifier) => {
  //                     if (ts.isIdentifier(importSpecifier)) {
  //                       identifiers.push(importSpecifier);
  //                     }
  //                   });
  //                 }
  //               });
  //             }
  //           });
  //         }
  //       });
  //
  //       if (nameFromWhereImportIs) {
  //         identifiers.forEach((identifier) => {
  //           imports.push({
  //             identifier,
  //             nameFromWhereImportIs: nameFromWhereImportIs!,
  //           });
  //         });
  //       }
  //     }
  //   });
  //
  //   return imports;
  // }
  //
  // private getTypeExportedModule(tsType: ts.Type, tsNode: ts.Node) {
  //   if (ts.isExternalModuleReference(tsNode)) {
  //     // todo: doesn't work. Can it help with React imports detection?
  //     debugger;
  //     console.log('debugger');
  //     return tsType.aliasSymbol;
  //   }
  //   if (ts.isExternalModuleNameRelative(tsNode.getFullText())) {
  //     // todo: doesn't work. Can it help with React imports detection?
  //     debugger;
  //     console.log('debugger');
  //     return tsType.aliasSymbol;
  //   }
  //   if (ts.isExternalModuleReference(tsNode)) {
  //     // todo: doesn't work. Can it help with React imports detection?
  //     debugger;
  //     console.log('debugger');
  //     return tsType.aliasSymbol;
  //   }
  //   if (ts.isModuleBlock(tsNode)) {
  //     // todo: doesn't work. Can it help with React imports detection?
  //     debugger;
  //     console.log('debugger');
  //     return tsType.aliasSymbol;
  //   }
  //   if (ts.isModuleDeclaration(tsNode)) {
  //     // todo: doesn't work. Can it help with React imports detection?
  //     debugger;
  //     console.log('debugger');
  //     return tsType.aliasSymbol;
  //   }
  //   if (ts.isModuleReference(tsNode)) {
  //     // todo: doesn't work. Can it help with React imports detection?
  //     debugger;
  //     console.log('debugger');
  //     return tsType.aliasSymbol;
  //   }
  //
  //   let module = (tsType.symbol ?? tsType.aliasSymbol) as ts.Symbol & {
  //     parent?: ts.Symbol;
  //   };
  //
  //   while (module?.parent) {
  //     module = module.parent;
  //     if (ts.isExternalModuleReference(module as any)) {
  //       // todo: doesn't work. Can it help with React imports detection?
  //       debugger;
  //       console.log('debugger');
  //       break;
  //     }
  //     if (ts.isExternalModuleNameRelative(module.name)) {
  //       // todo: doesn't work. Can it help with React imports detection?
  //       debugger;
  //       console.log('debugger');
  //       break;
  //     }
  //     if (ts.isExternalModuleReference(module as any)) {
  //       // todo: doesn't work. Can it help with React imports detection?
  //       debugger;
  //       console.log('debugger');
  //       break;
  //     }
  //     if (module.exports) {
  //       // we assume that it is React root type
  //       break;
  //     }
  //   }
  //
  //   return module as ts.Symbol;
  // }

  private handleImportedTypes(
    name: string,
    parsedProperty: ParsedProperty,
    tsNode: ts.Node,
    typeArguments?: ts.NodeArray<ts.TypeNode>,
  ) {
    let identifierSymbol: ts.Symbol | undefined;
    for (const nodeChild of tsNode.getChildren()) {
      if (ts.isIdentifier(nodeChild)) {
        identifierSymbol = this.typeChecker.getSymbolAtLocation(nodeChild);
        break;
      }
    }

    const symbolDeclarations = identifierSymbol?.getDeclarations();
    if (!symbolDeclarations?.length) {
      return false;
    }

    const isImport = symbolDeclarations.some(
      (declaration) =>
        ts.isImportSpecifier(declaration) ||
        ts.isImportClause(declaration) ||
        ts.isExternalModuleReference(declaration),
    );

    if (isImport) {
      parsedProperty.type = 'imported-type';
      parsedProperty.value = tsNode.getFullText().trim();
      return true;
    }

    if (symbolDeclarations.length === 1) {
      const [declaration] = symbolDeclarations;
      // if (
      //   ts.isInterfaceDeclaration(declaration) ||
      //   ts.isTypeAliasDeclaration(declaration)
      // ) {
      //   if (declaration.typeParameters?.length) {
      //     return false;
      //   }
      // }
      if (
        typeArguments?.length ||
        (tsNode as { typeArguments?: unknown[] }).typeArguments?.length
      ) {
        return false;
      }

      const tsType = this.typeChecker.getTypeAtLocation(tsNode);
      if (
        this.handleGenericPropertyAsConstraint(name, parsedProperty, tsType)
      ) {
        return true;
      }

      this.parseType({
        debugName: declaration.getFullText(),
        tsNode: declaration,
        parsedProperty,
      });
      return true;
    }

    return false;
  }

  private getTypeProperties(type: ts.Type) {
    const properties = type.getProperties();
    const apparentProperties = type.getApparentProperties();
    const joinedProperties = properties.concat(apparentProperties);
    return joinedProperties.filter(
      (sym, index) => joinedProperties.indexOf(sym) === index,
    );
  }

  private handleGenericPropertyAsConstraint(
    name: string,
    parsedProperty: ParsedProperty,
    type: ts.Type,
  ) {
    const genericTypeConstraint = type.getConstraint() as ts.Type & {
      intrinsicName?: string;
    };
    if (genericTypeConstraint?.intrinsicName) {
      parsedProperty.type = 'generic-constraint';
      parsedProperty.value = genericTypeConstraint.intrinsicName;
      return true;
    }

    return false;
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
    name: string,
    parsedProperty: ParsedProperty,
    tsNode: ts.Node,
    typeArguments?: ts.NodeArray<ts.TypeNode>,
  ) {
    const tsType = this.typeChecker.getTypeAtLocation(tsNode);
    if (this.handleGenericPropertyAsConstraint(name, parsedProperty, tsType)) {
      return true;
    }

    const symbol = tsType.symbol ?? tsType.aliasSymbol;
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
      return false;
    }

    const argument = typeArguments.at(genericParameterPosition);
    if (argument) {
      this.parseType({
        debugName: declaration.getFullText(),
        tsNode: argument,
        parsedProperty,
        typeArguments,
      });

      return true;
    }

    return false;
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
    name: string,
    parsedProperty: ParsedProperty,
    tsReferenceNode: ts.TypeReferenceNode,
  ) {
    const tsType = this.typeChecker.getTypeAtLocation(tsReferenceNode);
    const properties = this.getTypeProperties(tsType);
    if (!properties.length) {
      return false;
    }

    parsedProperty.type = 'object';
    parsedProperty.value = {};

    for (
      let propertyIndex = 0;
      propertyIndex < properties.length;
      propertyIndex++
    ) {
      const propertySymbol = properties[propertyIndex];
      const passedGenericType = tsReferenceNode.typeArguments?.[propertyIndex];

      if (propertySymbol.valueDeclaration) {
        let propertyName: string | undefined;
        let nestedProperty: ParsedProperty | undefined;

        if (passedGenericType) {
          propertySymbol.valueDeclaration.forEachChild((grandChildNode) => {
            if (ts.isIdentifier(grandChildNode)) {
              propertyName = grandChildNode.text;
              return;
            }

            nestedProperty = this.parseType({
              debugName: passedGenericType.getFullText(),
              tsNode: passedGenericType,
            });
          });
        } else {
          ({ propertyName, parsedProperty: nestedProperty } =
            this.parsePropertySignatureNode(
              propertySymbol.valueDeclaration.getFullText(),
              propertySymbol.valueDeclaration,
              tsReferenceNode.typeArguments,
            ));
        }

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
    name: string,
    parsedProperty: ParsedProperty,
    tsReferenceNode: ts.TypeReferenceNode,
    typeArguments?: ts.NodeArray<ts.TypeNode>,
  ) {
    const tsType = this.typeChecker.getTypeAtLocation(tsReferenceNode);

    const { declaration } = tsType as unknown as { declaration?: ts.Node };
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
