import path from 'path';
import { ParsedProperty } from '../../types';
import { flatAndFilterPropertyByName } from './utils/findPropertyByName';
import { onceParsing } from './utils/onceParsing';

describe('[class] Literal parser', () => {
  const filePath = path.join(__dirname, 'Literal.props.ts');

  const _parse = onceParsing(filePath);

  test('string literal is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_string');
    expect(property).toEqual([
      {
        propertyName: 'props_string',
        type: 'string-literal',
        value: 'string_1',
      },
    ] satisfies ParsedProperty[]);
  });

  test('number literal is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_number');
    expect(property).toEqual([
      {
        propertyName: 'props_number',
        type: 'number-literal',
        value: 25,
      },
    ] satisfies ParsedProperty[]);
  });

  test('bigint literal is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_bigint');
    expect(property).toEqual([
      {
        propertyName: 'props_bigint',
        type: 'bigint-literal',
        value: 100n,
      },
    ] satisfies ParsedProperty[]);
  });

  test('true literal is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_true');
    expect(property).toEqual([
      {
        propertyName: 'props_true',
        type: 'boolean-literal',
        value: true,
      },
    ] satisfies ParsedProperty[]);
  });

  test('true literal is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_false');
    expect(property).toEqual([
      {
        propertyName: 'props_false',
        type: 'boolean-literal',
        value: false,
      },
    ] satisfies ParsedProperty[]);
  });

  test('full parsed type is parsed correctly', async () => {
    const result = await _parse();
    expect(result).toEqual(expectedResult());

    function expectedResult(): ParsedProperty[] {
      return [
        {
          nodeText: 'Props',
          type: 'object',
          value: [
            {
              propertyName: 'props_string',
              type: 'string-literal',
              value: 'string_1',
            },
            {
              propertyName: 'props_number',
              type: 'number-literal',
              value: 25,
            },
            {
              propertyName: 'props_bigint',
              type: 'bigint-literal',
              value: 100n,
            },
            {
              propertyName: 'props_true',
              type: 'boolean-literal',
              value: true,
            },
            {
              propertyName: 'props_false',
              type: 'boolean-literal',
              value: false,
            },
          ],
        },
      ];
    }
  });
});
