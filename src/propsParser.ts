import * as path from 'path';
import ts from 'typescript';
import { TypeParser } from './TypeParser';

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
  lib: ['dom', 'dom.iterable', 'esnext'],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noImplicitAny: true,
  resolveJsonModule: true,
  skipLibCheck: true,
  strictNullChecks: true,
  sourceMap: true,
  strict: true,
  target: ts.ScriptTarget.ESNext,
};

async function printComponentProps(componentFilePath: string) {
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

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const propsNodes: ts.Node[] = [];

  // Loop through the root AST nodes of the file
  ts.forEachChild(sourceFile, (node) => {
    let name = '';

    // https://ts-ast-viewer.com/ to see the AST of a file then use the same patterns
    if (ts.isTypeAliasDeclaration(node)) {
      name = node.name.text;

      if (name === 'Props') {
        let propsNodeDefinition: ts.Node | undefined;
        node.forEachChild((propsNode) => {
          if (ts.isTypeLiteralNode(propsNode)) {
            propsNodeDefinition = propsNode;
          }
        });

        if (propsNodeDefinition) {
          propsNodes.push(propsNodeDefinition);
        }
      }
    } else if (ts.isInterfaceDeclaration(node)) {
      name = node.name.text;

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
  console.log(
    printer.printNode(ts.EmitHint.Unspecified, propsNode, sourceFile),
  ) + '\n';

  const typeParser = new TypeParser(typeChecker);
  const parsedProperties = typeParser.parse('Props', propsNode);

  console.log(JSON.stringify(parsedProperties, null, 2));
}

printComponentProps(path.join('src', 'TestComponent.tsx'));
