import { findPropertyTsNode } from '../../../../findPropertyTsNode';
import { findTsNodeInFile } from '../../../../findTsNodeInFile';
import { testCompilerOptions } from '../../../testCompilerOptions';

export async function getPropertyNode(filePath: string, propertyName: string) {
  const founded = (await findTsNodeInFile(
    filePath,
    'Props',
    testCompilerOptions
  ))!;

  const tsNode = findPropertyTsNode(propertyName, founded.tsNode)!;
  return {
    tsNode,
    typeChecker: founded.typeChecker,
  };
}
