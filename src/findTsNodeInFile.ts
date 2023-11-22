import { stat } from 'fs/promises';
import ts from 'typescript';
import { NotFoundError, SourceFileError } from './errors';

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
    throw new NotFoundError(`file not found for path (${filePath})`);
  }

  const host = ts.createCompilerHost(compilerOptions);
  const program = ts.createProgram({
    host,
    options: compilerOptions,
    rootNames: [filePath],
  });
  const sourceFile = program.getSourceFile(filePath);

  if (!sourceFile) {
    throw new SourceFileError(
      `we can not to make SourceFile from a file (${filePath})`
    );
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
    throw new NotFoundError(`node with name "${nodeName}" is not found`);
  }

  return {
    tsNode,
    typeChecker,
  };
}
