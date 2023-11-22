import ts from 'typescript';
import { findPropertyTsNode } from './findPropertyTsNode';
import { findTsNodeInFile } from './findTsNodeInFile';

export async function findPropertyTsNodeInFile(
  propertyName: string,
  fileOptions: {
    filePath: string;
    nodeName: string;
    compilerOptions: ts.CompilerOptions;
  },
): Promise<ts.Node | undefined> {
  const founded = await findTsNodeInFile(
    fileOptions.filePath,
    fileOptions.nodeName,
    fileOptions.compilerOptions,
  );
  if (!founded) {
    return;
  }

  return findPropertyTsNode(propertyName, founded.tsNode);
}
