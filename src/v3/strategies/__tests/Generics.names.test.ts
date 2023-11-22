import path from 'path';
import { ParsedProperty, ParsedUnionType } from '../../types';
import { onceParsing } from './utils/onceParsing';

describe('[class] TypeReference parser for generics (names version)', () => {
  const filePath = path.join(__dirname, 'Generics.names.props.ts');

  const _parse = onceParsing(filePath);

  test('all properties have corrected propertyNames', async () => {
    const result = await _parse();
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
