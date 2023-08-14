import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';
import { parseChain } from './parseChain';
import { ITypeParser } from './ITypeParser';

export class TypeParser implements ITypeParser {
  constructor(
    public readonly typeChecker: ts.TypeChecker,
    private readonly properties: {
      [propertyName: string]: ParsedProperty;
    } = {},
  ) {}

  parse(params: {
    debugName?: string;
    tsNode: ts.Node;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  }) {
    const { tsNode, debugName = tsNode.getFullText(), typeArguments } = params;
    const intersectionParsedProperty = {} as ParsedProperty;

    parseChain
      .call(this, {
        tsNode,
        parsedProperty: intersectionParsedProperty,
      })
      .intersectionType()
      .fallback(() => {
        tsNode.forEachChild((childNode) => {
          let propertyName: string | undefined;
          let parsedProperty: ParsedProperty | undefined;

          if (ts.isPropertySignature(childNode)) {
            ({ propertyName, parsedProperty } = this.parsePropertySignatureNode(
              {
                debugName,
                tsNode: childNode,
                typeArguments,
              },
            ));
          } else if (ts.isTypeLiteralNode(childNode)) {
            this.parse({ tsNode: childNode });
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
      });

    if (intersectionParsedProperty.type === 'intersection-type') {
      return intersectionParsedProperty;
    }

    return this.properties;
  }

  parsePropertySignatureNode(params: {
    debugName?: string;
    tsNode: ts.Node;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  }): {
    propertyName: string | undefined;
    parsedProperty: ParsedProperty | undefined;
  } {
    const { tsNode, typeArguments, debugName = tsNode.getFullText() } = params;

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
    }

    return {
      propertyName,
      parsedProperty,
    };
  }

  parseType(params: {
    debugName?: string;
    tsNode: ts.Node;
    // it is required in cases when you process optional properties: QuestionToken will be adjusted to existed property descriptor instead of overriding it
    parsedProperty?: ParsedProperty;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  }) {
    const {
      tsNode,
      debugName = tsNode.getFullText(),
      parsedProperty = {} as ParsedProperty,
      typeArguments,
    } = params;

    parseChain
      .call(this, {
        debugName,
        tsNode,
        parsedProperty,
        typeArguments,
      })
      .questionToken()

      .primitiveType()
      .literalType()
      .intersectionType()
      .unionType()
      .arrayType()

      .importedType()
      .inBuiltType()
      .localDefinedType()
      .mappedType()

      .genericPropertyWithArgumentInReferencedType()
      .genericProperty()

      .typeAlias()
      .interfaceDeclaration()

      .fallback(() => {
        parsedProperty.type = 'not-parsed';
        parsedProperty.value = tsNode.getFullText().trim();
      });

    return parsedProperty;
  }
}
