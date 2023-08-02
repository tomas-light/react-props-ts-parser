import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';
import { parseGenericPropertyAsConstraint } from './parseGenericPropertyAsConstraint';
import { ITypeParser } from './ITypeParser';

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
export function parseGenericPropertyWithArgumentInReferencedType(
  this: Pick<ITypeParser, 'typeChecker' | 'parseType'>,
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  },
) {
  const {
    tsNode,
    parsedProperty,
    debugName = tsNode.getFullText(),
    typeArguments,
  } = params;

  if (!ts.isTypeReferenceNode(tsNode)) {
    return false;
  }

  const tsType = this.typeChecker.getTypeAtLocation(tsNode);
  if (parseGenericPropertyAsConstraint({ parsedProperty, tsType })) {
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

  const genericParameterPosition = declaration.parent.typeParameters?.findIndex(
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
