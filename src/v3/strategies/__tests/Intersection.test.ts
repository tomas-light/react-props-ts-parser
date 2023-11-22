import path from 'path';
import { ParsedProperty } from '../../types';
import { flatAndFilterPropertyByName } from './utils/findPropertyByName';
import { onceParsing } from './utils/onceParsing';

describe('[class] Intersection parser', () => {
  const filePath = path.join(__dirname, 'Intersection.props.ts');

  const _parse = onceParsing(filePath);

  test('first property of first inherited object is presented in parsed result and it is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'external_string1');
    expect(property).toEqual([
      {
        optional: true,
        propertyName: 'external_string1',
        type: 'string',
      },
    ] satisfies ParsedProperty[]);
  });

  test('second property of first inherited object is presented in parsed result and it is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'external_string2');
    expect(property).toEqual([
      {
        propertyName: 'external_string2',
        type: 'string',
      },
    ] satisfies ParsedProperty[]);
  });

  test('first self property of inherited interception type is presented in parsed result and it is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'external_number1');
    expect(property).toEqual([
      {
        propertyName: 'external_number1',
        type: 'number',
      },
    ] satisfies ParsedProperty[]);
  });

  test('second self property of inherited interception type is presented in parsed result and it is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'external_number2');
    expect(property).toEqual([
      {
        propertyName: 'external_number2',
        type: 'number',
      },
    ] satisfies ParsedProperty[]);
  });

  test('first inherited property of inherited interception type is presented in parsed result and it is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'external_boolean1');
    expect(property).toEqual([
      {
        propertyName: 'external_boolean1',
        type: 'boolean',
      },
    ] satisfies ParsedProperty[]);
  });

  test('second inherited property of inherited interception type is presented in parsed result and it is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'external_boolean2');
    expect(property).toEqual([
      {
        propertyName: 'external_boolean2',
        type: 'boolean',
      },
    ] satisfies ParsedProperty[]);
  });

  test('first self property is presented in parsed result and it is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_string1');
    expect(property).toEqual([
      {
        propertyName: 'props_string1',
        type: 'string',
      },
    ] satisfies ParsedProperty[]);
  });

  test('second self property is presented in parsed result and it is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_string2');
    expect(property).toEqual([
      {
        propertyName: 'props_string2',
        type: 'string',
      },
    ] satisfies ParsedProperty[]);
  });

  test('full parsed type is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }
    expect(result).toEqual(expectedResult());

    function expectedResult(): ParsedProperty[] {
      return [
        {
          nodeText: 'Props',
          type: 'object',
          value: [
            {
              optional: true,
              propertyName: 'external_string1',
              type: 'string',
            },
            {
              propertyName: 'external_string2',
              type: 'string',
            },
          ],
        },
        {
          nodeText: 'Props',
          type: 'object',
          value: [
            {
              propertyName: 'external_boolean1',
              type: 'boolean',
            },
            {
              propertyName: 'external_boolean2',
              type: 'boolean',
            },
          ],
        },
        {
          nodeText: 'Props',
          type: 'object',
          value: [
            {
              propertyName: 'external_number1',
              type: 'number',
            },
            {
              propertyName: 'external_number2',
              type: 'number',
            },
          ],
        },
        {
          nodeText: 'Props',
          type: 'object',
          value: [
            {
              propertyName: 'props_string1',
              type: 'string',
            },
            {
              propertyName: 'props_string2',
              type: 'string',
            },
          ],
        },
      ];
    }
  });
});
