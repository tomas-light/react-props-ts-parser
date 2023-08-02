import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';
import { ITypeParser } from './ITypeParser';

/**
 * @example
 * type Props = {
 *  classes: Record<string, string>; <---- node
 * }
 * type Record<K extends keyof any, T> = { <---- type
 *   [P in K]: T; <---- declaration/mappedTypeNode
 * };
 * */
export function parseMappedType(
  this: Pick<ITypeParser, 'typeChecker'>,
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

  const { declaration } = tsType as unknown as { declaration?: ts.Node };
  if (!declaration || !ts.isMappedTypeNode(declaration)) {
    return false;
  }

  parsedProperty.type = 'not-parsed';
  parsedProperty.value = tsNode.getFullText().trim();

  // const names: string[] = [];
  //
  // // mappedTypeNode.typeParameter.symbol === type.typeParameter.symbol
  //
  // const mappedTypeNode = declaration;
  // const mappedTypeNodeTypeParameter = mappedTypeNode.typeParameter; // "P" in "P in K"
  // const passedTypeArguments = typeArguments || tsNode.typeArguments;
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
