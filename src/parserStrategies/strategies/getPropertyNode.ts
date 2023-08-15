import { findPropertyTsNode } from '../../findPropertyTsNode';
import { findTsNodeInFile } from '../../findTsNodeInFile';
import { compilerOptions } from '../../tests/compilerOptions';

export async function getPropertyNode(filePath: string, propertyName: string) {
  const founded = (await findTsNodeInFile(filePath, 'Props', compilerOptions))!;

  const tsNode = findPropertyTsNode(propertyName, founded.tsNode)!;
  return {
    tsNode,
    typeChecker: founded.typeChecker,
  };
}
