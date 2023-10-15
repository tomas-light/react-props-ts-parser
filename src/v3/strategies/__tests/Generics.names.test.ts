import path from 'path';
import { findTsNodeInFile } from '../../../findTsNodeInFile';
import { parse } from '../../parse';
import { testCompilerOptions } from '../../testCompilerOptions';
import { ParsedProperty, ParsedUnionType } from '../../types';

describe('[class] TypeReference parser for generics (names version)', () => {
  const filePath = path.join(__dirname, 'Generics.names.props.ts');

  test('all properties have corrected propertyNames', async () => {
    const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
      filePath,
      'Props',
      testCompilerOptions
    ))!;

    const result = parse(propsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual(expectedResult());

    function expectedResult(): ParsedProperty[] {
      const union = (): ParsedUnionType => ({
        type: 'union-type',
        value: [
          {
            type: 'string-literal',
            value: 'prop_a',
          },
          {
            type: 'string-literal',
            value: 'prop_b',
          },
        ],
      });

      return [
        {
          nodeText: 'Props',
          type: 'object',
          value: [
            {
              ...union(),
              propertyName: 'props_id',
            },
            {
              ...union(),
              propertyName: 'props_id_2',
            },
            {
              ...union(),
              propertyName: 'props_id_3',
            },
            {
              ...union(),
              propertyName: 'props_id_4',
            },
            {
              ...union(),
              propertyName: 'props_id_5',
            },
          ],
        },
      ];
    }
  });
});
