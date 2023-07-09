import * as path from 'path';
import ts, { NodeBuilderFlags } from 'typescript';

const compilerOptions: ts.CompilerOptions = {
  allowSyntheticDefaultImports: true,
  composite: true,
  declaration: true,
  declarationMap: true,
  esModuleInterop: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  forceConsistentCasingInFileNames: true,
  isolatedModules: true,
  jsx: ts.JsxEmit.ReactJSX,
  lib: ["dom", "dom.iterable", "esnext"],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noImplicitAny: true,
  resolveJsonModule: true,
  skipLibCheck: true,
  strictNullChecks: true,
  sourceMap: true,
  strict: true,
  target: ts.ScriptTarget.ESNext
};

async function printComponentProps(componentFilePath: string) {
  // const fileContent = await readFile(componentFilePath, 'utf-8');

  const host = ts.createCompilerHost(compilerOptions);
  const program = ts.createProgram({
    host,
    options: compilerOptions,
    rootNames: [componentFilePath],
  });
  const typeChecker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(componentFilePath);

  if (!sourceFile) {
    return;
  }

  // const sourceFile = ts.createSourceFile('any-file-name', fileContent, compilerOptions.target!);

  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});

  const propsNodes: ts.Node[] = [];

  // Loop through the root AST nodes of the file
  ts.forEachChild(sourceFile, node => {
    let name = "";

    // https://ts-ast-viewer.com/ to see the AST of a file then use the same patterns
    if (ts.isTypeAliasDeclaration(node)) {
      name = node.name.text;

      if (name === 'Props') {
        let propsNodeDefinition: ts.Node | undefined;
        node.forEachChild(propsNode => {
          if (ts.isTypeLiteralNode(propsNode)) {
            propsNodeDefinition = propsNode
          }
        })

        if (propsNodeDefinition) {
          propsNodes.push(propsNodeDefinition);
        }
      }
    } else if (ts.isInterfaceDeclaration(node)) {
      name = node.name.text

      if (name === 'Props') {
        propsNodes.push(node);
      }
    }
  });

  if (propsNodes.length === 0) {
    console.log('props are not found');
    return;
  }

  if (propsNodes.length > 1) {
    console.log('too many props declarations');
    return;
  }

  const [propsNode] = propsNodes;
  console.log(printer.printNode(ts.EmitHint.Unspecified, propsNode, sourceFile)) + "\n";

  const myPropsObject = {} as Record<string, any>;

  propsNode.forEachChild(node => {
    if (!ts.isPropertySignature(node)) {
      return;
    }

    let propertyName: string;
    let myDescriptor: any = {};

    node.forEachChild(childNode => {
      if (ts.isIdentifier(childNode)) {
        propertyName = childNode.text;
        return;
      }

      fillDescriptor(myDescriptor, childNode, typeChecker);
    });

    myPropsObject[propertyName!] = myDescriptor;
  });

  console.log(JSON.stringify(myPropsObject, null, 2));
}

function fillDescriptor(myDescriptor: any, node: ts.Node, typeChecker: ts.TypeChecker, typeArguments?: ts.NodeArray<ts.TypeNode>) {
  if (ts.isQuestionToken(node)) {
    optionalDescriptor(myDescriptor, true);
    return;
  }

  if (ts.isNumericLiteral(node)) {
    numberLiteralDescriptor(myDescriptor);
    return;
  }

  if (node.kind === ts.SyntaxKind.NumberKeyword) {
    numberDescriptor(myDescriptor);
    return;
  }

  if (node.kind === ts.SyntaxKind.BooleanKeyword) {
    booleanDescriptor(myDescriptor);
    return;
  }

  if (ts.isStringLiteral(node)) {
    stringLiteralDescriptor(myDescriptor);
    return;
  }

  if (node.kind === ts.SyntaxKind.StringKeyword) {
    stringDescriptor(myDescriptor);
    return;
  }

  if (ts.isFunctionTypeNode(node)) {
    functionDescriptor(myDescriptor);
    return;
  }

  if (ts.isUnionTypeNode(node)) {
    unionTypeDescriptor(myDescriptor);

    node.forEachChild(unionTypeNode => {
      if (ts.isLiteralTypeNode(unionTypeNode)) {
        if (ts.isStringLiteral(unionTypeNode.literal)) {
          myDescriptor.values.push(unionTypeNode.literal.text);
          return;
        }
        if (ts.isNumericLiteral(unionTypeNode.literal)) {
          myDescriptor.values.push(unionTypeNode.literal.text);
          return;
        }
        return;
      }
    });

    return;
  }

  if (ts.isArrayTypeNode(node)) {
    myDescriptor.type = 'array';
    myDescriptor.descriptor = {} as any;

    node.forEachChild(itemNode => {
      // todo: property signature won't work now
      fillDescriptor(myDescriptor.descriptor, itemNode, typeChecker);
    })

    return;
  }

  if (ts.isTypeReferenceNode(node)) {
    const type = typeChecker.getTypeAtLocation(node);

    const { declaration } = type as unknown as { declaration?: ts.Node };
    if (declaration && ts.isMappedTypeNode(declaration)) {
      // type Props = {
      //   classes: Record<string, string>; <---- node
      // }
      // type Record<K extends keyof any, T> = { <---- type
      //   [P in K]: T; <---- declaration/mappedTypeNode
      // };

      let names: string[] = [];
      let valueDescriptor: any = {};

      // true
      // mappedTypeNode.typeParameter.symbol === type.typeParameter.symbol

      const mappedTypeNode = declaration;
      const mappedTypeNodeTypeParameter = mappedTypeNode.typeParameter; // "P" in "P in K"
      const passedTypeArguments = (typeArguments || node.typeArguments);
      // const typeAliasTypeParameters = ;

      // const index = typeAliasTypeParameters.findIndex(declaredParameter => declaredParameter.);
      const index = -1;
      const argument = passedTypeArguments?.at(index);

      if (argument) {
        const text = argument.getText();
        names.push(text);
      }


      mappedTypeNode.forEachChild(mappedNode => {
        const parameterOrValue = mappedNode;

        // if (ts.isTypeParameterDeclaration(parameterOrValue)) {
        //   const passedTypeArguments = (typeArguments || node.typeArguments);
        //   // const typeAliasTypeParameters = ;
        //
        //   // const index = typeAliasTypeParameters.findIndex(declaredParameter => declaredParameter.);
        //   const index = -1;
        //   const argument = passedTypeArguments?.at(index);
        //
        //   if (argument) {
        //     const text = argument.getText();
        //     names.push(text);
        //   }
        //   return;
        // }

        if (ts.isTypeReferenceNode(parameterOrValue)) {
          const a = 1;
        }
      });

      names.forEach(name => {
        myDescriptor[name] = valueDescriptor;
      });
    }

    const properties = type.getProperties();
    const apparentProperties = type.getApparentProperties();
    if (apparentProperties.length === 0 && properties.length === 0) {
      const declarations = type.symbol.getDeclarations();
      if (!declarations?.length || declarations.length > 1) {
        // can be more than one? what should we do?
        return;
      }

      const [declaration] = declarations;
      if (!ts.isTypeParameterDeclaration(declaration) || !typeArguments) {
        // what's here?
        return;
      }

      if (!ts.isInterfaceDeclaration(declaration.parent) && !ts.isTypeAliasDeclaration(declaration.parent) && !ts.isJSDocTemplateTag(declaration.parent)) {
        // has no typeParameters field
        return;
      }

      const genericParameterPosition = declaration.parent.typeParameters?.findIndex(parameter => parameter.name === declaration.name);
      if (genericParameterPosition == null) {
        // wrong type
        return;
      }

      const argument = typeArguments.at(genericParameterPosition);
      if (argument) {
        fillDescriptor(myDescriptor, argument, typeChecker);
      }

      return;
    }

    myDescriptor.type = 'typeReference';
    myDescriptor.descriptor = {} as any;

    for (const propertySymbol of apparentProperties) {
      myDescriptor.descriptor[propertySymbol.name] = {};
      const declarations = propertySymbol.getDeclarations();
      if (declarations) {
        for (const declaration of declarations) {
          declaration.forEachChild(declarationChild => {
            fillDescriptor(myDescriptor.descriptor[propertySymbol.name], declarationChild, typeChecker, node.typeArguments);
          });
        }
      }
    }

    return;
  }
}

function stringDescriptor(myDescriptor: any) {
  myDescriptor.type = 'string';
}
function stringLiteralDescriptor(myDescriptor: any) {
  myDescriptor.type = 'string-literal';
}
function numberDescriptor(myDescriptor: any) {
  myDescriptor.type = 'number';
}
function numberLiteralDescriptor(myDescriptor: any) {
  myDescriptor.type = 'number-literal';
}
function booleanDescriptor(myDescriptor: any) {
  myDescriptor.type = 'boolean';
}
function functionDescriptor(myDescriptor: any) {
  myDescriptor.type = 'function';
}
function optionalDescriptor(myDescriptor: any, value: boolean) {
  myDescriptor.optional = value;
}
function unionTypeDescriptor(myDescriptor: any) {
  myDescriptor.type = 'unionType';
  myDescriptor.values = [];
}


printComponentProps(path.join('src', 'TestComponent.tsx'));
