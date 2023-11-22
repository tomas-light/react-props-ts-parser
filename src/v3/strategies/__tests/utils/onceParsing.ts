import { findTsNodeInFile } from '../../../../findTsNodeInFile';
import { parse } from '../../../parse';
import { ParseOptions } from '../../../ParseFunction';
import { testCompilerOptions } from '../../../testCompilerOptions';
import { ParsedProperty } from '../../../types';

export function onceParsing(filePath: string, options?: Partial<ParseOptions>) {
  let propsNode: NonNullable<
    Awaited<ReturnType<typeof findTsNodeInFile>>
  >['tsNode'];

  let typeChecker: NonNullable<
    Awaited<ReturnType<typeof findTsNodeInFile>>
  >['typeChecker'];

  let parsedProperties: ParsedProperty[] | undefined;

  async function _parse() {
    if (!propsNode || !typeChecker) {
      const founded = await findTsNodeInFile(
        filePath,
        'Props',
        testCompilerOptions
      );
      ({ tsNode: propsNode, typeChecker } = founded!);
    }

    if (parsedProperties) {
      return parsedProperties;
    }

    parsedProperties = parse(propsNode, {
      typeChecker,
      nodeCacheMap: new Map(),
      ...options,
    });

    return parsedProperties;
  }

  return _parse;
}
