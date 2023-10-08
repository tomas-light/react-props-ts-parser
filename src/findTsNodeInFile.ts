import { stat } from 'fs/promises';
import ts from 'typescript';

export async function findTsNodeInFile(
  filePath: string,
  nodeName: string,
  compilerOptions: ts.CompilerOptions
): Promise<
  | {
      tsNode: ts.TypeAliasDeclaration | ts.InterfaceDeclaration;
      typeChecker: ts.TypeChecker;
    }
  | undefined
> {
  const fileStats = await stat(filePath);
  if (!fileStats.isFile()) {
    console.error('file not found for path', filePath);
    return undefined;
  }

  const host = ts.createCompilerHost(compilerOptions);
  const program = ts.createProgram({
    host,
    options: compilerOptions,
    rootNames: [filePath],
  });
  const sourceFile = program.getSourceFile(filePath);

  if (!sourceFile) {
    console.error('we can not to make SourceFile from a file', filePath);
    return undefined;
  }

  const typeChecker = program.getTypeChecker();

  let tsNode: ts.TypeAliasDeclaration | ts.InterfaceDeclaration | undefined;

  ts.forEachChild(sourceFile, (node) => {
    if (tsNode) {
      return;
    }

    if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      const name = node.name.text;
      if (name === nodeName) {
        tsNode = node;
        return;
      }
    }
  });

  if (!tsNode) {
    console.error(`node with name "${nodeName}" is not found`);
    return undefined;
  }

  return {
    tsNode,
    typeChecker,
  };
}
