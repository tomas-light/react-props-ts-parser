import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';
import { ITypeParser } from './ITypeParser';

function getTypeProperties(type: ts.Type) {
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
 *   myProp: T;
 * };
 *
 * type TypeToParse = {
 *   someProp: MyGeneric<string>; // <-- here we go (param 'type' === MyGeneric)
 * };
 * */
export function parseGenericProperty(
  this: Pick<
    ITypeParser,
    'typeChecker' | 'parseType' | 'parsePropertySignatureNode'
  >,
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
) {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;

  if (!ts.isTypeReferenceNode(tsNode)) {
    return false;
  }

  const tsType = this.typeChecker.getTypeAtLocation(tsNode);
  const properties = getTypeProperties(tsType);
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
    const passedGenericType = tsNode.typeArguments?.[propertyIndex];

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
          this.parsePropertySignatureNode({
            tsNode: propertySymbol.valueDeclaration,
            typeArguments: tsNode.typeArguments,
          }));
      }

      if (propertyName && nestedProperty) {
        parsedProperty.value[propertyName as keyof ParsedProperty] =
          nestedProperty as never;
      }
    }
  }

  return true;
}
