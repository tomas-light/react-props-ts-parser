import ts from 'typescript';
import { TypeParser } from './TypeParser';

export function parsePropsInFile(
  componentFilePath: string,
  compilerOptions: ts.CompilerOptions,
) {
  const host = ts.createCompilerHost(compilerOptions);
  const program = ts.createProgram({
    host,
    options: compilerOptions,
    rootNames: [componentFilePath],
  });
  const typeChecker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(componentFilePath);

  if (!sourceFile) {
    console.error(`source file is not found on ${componentFilePath}`);
    return { source: null, parsed: null };
  }

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
          if (!ts.isIdentifier(propsNode)) {
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
    console.error('props are not found');
    return { source: null, parsed: null };
  }

  if (propsNodes.length > 1) {
    console.error('too many props declarations');
    return { source: null, parsed: null };
  }

  const [propsNode] = propsNodes;

  const typeParser = new TypeParser(typeChecker);
  const parsedProperties = typeParser.parse('Props', propsNode);

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return {
    source: printer.printNode(ts.EmitHint.Unspecified, propsNode, sourceFile),
    parsed: parsedProperties,
  };
}
