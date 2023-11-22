import path from 'path';
import { ParsedProperty } from '../../types';
import { flatAndFilterPropertyByName } from './utils/findPropertyByName';
import { onceParsing } from './utils/onceParsing';

describe('JsDoc parsing', () => {
  const filePath = path.join(__dirname, 'JsDoc.props.ts');

  const _parse = onceParsing(filePath);

  test('line comment before the property is ignored', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'property_3');
    expect(property).toEqual([
      {
        jsDoc: {
          comment: 'comment 3',
          fullText: '/** comment 3 */',
        },
        propertyName: 'property_3',
        type: 'string',
      },
    ] satisfies ParsedProperty[]);
  });
});
