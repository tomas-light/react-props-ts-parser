import path from 'path';
import { ParsedProperty } from '../../types';
import { Props } from './Primitive.props';
import { findPropertyByName } from './utils/findPropertyByName';
import { onceParsing } from './utils/onceParsing';

describe('[class] Primitive parser', () => {
  const filePath = path.join(__dirname, 'Primitive.props.ts');

  const _parse = onceParsing(filePath);

  test('string property is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = findPropertyByName<Props>(result, 'props_string');
    expect(property).toEqual({
      propertyName: 'props_string',
      type: 'string',
    } satisfies ParsedProperty);
  });

  test('number property is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = findPropertyByName<Props>(result, 'props_number');
    expect(property).toEqual({
      propertyName: 'props_number',
      type: 'number',
    } satisfies ParsedProperty);
  });

  test('boolean property is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = findPropertyByName<Props>(result, 'props_boolean');
    expect(property).toEqual({
      propertyName: 'props_boolean',
      type: 'boolean',
    } satisfies ParsedProperty);
  });

  test('null property is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = findPropertyByName<Props>(result, 'props_null');
    expect(property).toEqual({
      propertyName: 'props_null',
      type: 'null',
    } satisfies ParsedProperty);
  });

  test('undefined property is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = findPropertyByName<Props>(result, 'props_undefined');
    expect(property).toEqual({
      propertyName: 'props_undefined',
      optional: true,
      type: 'undefined',
    } satisfies ParsedProperty);
  });

  test('bigint property is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = findPropertyByName<Props>(result, 'props_bigint');
    expect(property).toEqual({
      propertyName: 'props_bigint',
      type: 'bigint',
    } satisfies ParsedProperty);
  });

  test('symbol property is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = findPropertyByName<Props>(result, 'props_symbol');
    expect(property).toEqual({
      propertyName: 'props_symbol',
      type: 'symbol',
    } satisfies ParsedProperty);
  });

  test('function property is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = findPropertyByName<Props>(result, 'props_function');
    expect(property).toEqual({
      propertyName: 'props_function',
      type: 'function',
    } satisfies ParsedProperty);
  });

  test('any property is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = findPropertyByName<Props>(result, 'props_any');
    expect(property).toEqual({
      propertyName: 'props_any',
      type: 'any',
    } satisfies ParsedProperty);
  });

  test('unknown property is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = findPropertyByName<Props>(result, 'props_unknown');
    expect(property).toEqual({
      propertyName: 'props_unknown',
      type: 'unknown',
    } satisfies ParsedProperty);
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
              type: 'string',
            },
            {
              propertyName: 'props_number',
              type: 'number',
            },
            {
              propertyName: 'props_boolean',
              type: 'boolean',
            },
            {
              propertyName: 'props_null',
              type: 'null',
            },
            {
              optional: true,
              propertyName: 'props_undefined',
              type: 'undefined',
            },
            {
              propertyName: 'props_bigint',
              type: 'bigint',
            },
            {
              propertyName: 'props_symbol',
              type: 'symbol',
            },
            {
              propertyName: 'props_function',
              type: 'function',
            },
            {
              propertyName: 'props_any',
              type: 'any',
            },
            {
              propertyName: 'props_unknown',
              type: 'unknown',
            },
          ],
        },
      ];
    }
  });
});
