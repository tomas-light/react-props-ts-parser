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
    return {
      source: null,
      parsed: null,
      reason: `source file is not found on ${componentFilePath}`,
    };
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
    return { source: null, parsed: null, reason: 'props are not found' };
  }

  if (propsNodes.length > 1) {
    return {
      source: null,
      parsed: null,
      reason: 'too many props declarations',
    };
  }

  const [propsNode] = propsNodes;

  const typeParser = new TypeParser(typeChecker);
  const parsed = typeParser.parse({
    debugName: 'Props',
    tsNode: propsNode,
  });

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return {
    source: printer.printNode(ts.EmitHint.Unspecified, propsNode, sourceFile),
    parsed: parsed,
  };
}
