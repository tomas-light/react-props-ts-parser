import path from 'path';
import { ParsedProperty } from '../../types';
import { flatAndFilterPropertyByName } from './utils/findPropertyByName';
import { onceParsing } from './utils/onceParsing';

describe('[class] UnionType parser', () => {
  const filePath = path.join(__dirname, 'UnionType.props.ts');

  const _parse = onceParsing(filePath);

  test('1st inherited type: optional string is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(
      result,
      'external_optional_string'
    );
    expect(property).toEqual([
      {
        optional: true,
        propertyName: 'external_optional_string',
        type: 'string',
      },
    ] satisfies ParsedProperty[]);
  });

  test('1st inherited type: string is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'external_string');
    expect(property).toEqual([
      {
        propertyName: 'external_string',
        type: 'string',
      },
    ] satisfies ParsedProperty[]);
  });

  test('2nd inherited type (with 3rd type): number or string is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(
      result,
      'external_number_or_string'
    );
    expect(property).toEqual([
      {
        propertyName: 'external_number_or_string',
        type: 'union-type',
        value: [
          {
            type: 'number',
          },
          {
            type: 'string',
          },
        ],
      },
    ] satisfies ParsedProperty[]);
  });

  test('2nd inherited type (with 3rd type): number or boolean is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(
      result,
      'external_number_or_boolean'
    );
    expect(property).toEqual([
      {
        propertyName: 'external_number_or_boolean',
        type: 'union-type',
        value: [
          {
            type: 'number',
          },
          {
            type: 'boolean',
          },
        ],
      },
    ] satisfies ParsedProperty[]);
  });

  test('3rd inherited type: boolean or null is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(
      result,
      'external_boolean_or_null'
    );
    expect(property).toEqual([
      {
        propertyName: 'external_boolean_or_null',
        type: 'union-type',
        value: [
          {
            type: 'boolean',
          },
          {
            type: 'null',
          },
        ],
      },
    ] satisfies ParsedProperty[]);
  });

  test('3rd inherited type: boolean or symbol is presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(
      result,
      'external_boolean_or_symbol'
    );
    expect(property).toEqual([
      {
        propertyName: 'external_boolean_or_symbol',
        type: 'union-type',
        value: [
          {
            type: 'boolean',
          },
          {
            type: 'symbol',
          },
        ],
      },
    ] satisfies ParsedProperty[]);
  });

  test('1st self type: string union literals are presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(
      result,
      'props_string_literal'
    );
    expect(property).toEqual([
      {
        propertyName: 'props_string_literal',
        type: 'union-type',
        value: [
          {
            type: 'string-literal',
            value: 'string_1',
          },
          {
            type: 'string-literal',
            value: 'string_2',
          },
        ],
      },
    ] satisfies ParsedProperty[]);
  });

  test('1st self type: number union literals are presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(
      result,
      'props_number_literal'
    );
    expect(property).toEqual([
      {
        propertyName: 'props_number_literal',
        type: 'union-type',
        value: [
          {
            type: 'number-literal',
            value: 25,
          },
          {
            type: 'number-literal',
            value: 50,
          },
        ],
      },
    ] satisfies ParsedProperty[]);
  });

  test('2nd self type: bigint union literals are presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(
      result,
      'props_bigint_literal'
    );
    expect(property).toEqual([
      {
        propertyName: 'props_bigint_literal',
        type: 'union-type',
        value: [
          {
            type: 'bigint-literal',
            value: 25n,
          },
          {
            type: 'bigint-literal',
            value: 100n,
          },
        ],
      },
    ] satisfies ParsedProperty[]);
  });

  test('2nd self type: array or set are presented in parsed result and parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_array_or_set');
    expect(property).toEqual([
      {
        propertyName: 'props_array_or_set',
        type: 'union-type',
        value: [
          {
            nodeText: 'boolean[]',
            type: 'array',
            value: [
              {
                type: 'boolean',
              },
            ],
          },
          {
            type: 'not-parsed',
            value: 'Set<string>',
          },
        ],
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
          type: 'union-type',
          value: [
            {
              nodeText: 'ExternalProps',
              type: 'object',
              value: [
                {
                  optional: true,
                  propertyName: 'external_optional_string',
                  type: 'string',
                },
                {
                  propertyName: 'external_string',
                  type: 'string',
                },
              ],
            },
            {
              nodeText: 'ExternalProps2',
              type: 'union-type',
              value: [
                {
                  nodeText: 'ExternalProps3',
                  type: 'object',
                  value: [
                    {
                      propertyName: 'external_boolean_or_null',
                      type: 'union-type',
                      value: [
                        {
                          type: 'boolean',
                        },
                        {
                          type: 'null',
                        },
                      ],
                    },
                    {
                      propertyName: 'external_boolean_or_symbol',
                      type: 'union-type',
                      value: [
                        {
                          type: 'boolean',
                        },
                        {
                          type: 'symbol',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'object',
                  value: [
                    {
                      propertyName: 'external_number_or_string',
                      type: 'union-type',
                      value: [
                        {
                          type: 'number',
                        },
                        {
                          type: 'string',
                        },
                      ],
                    },
                    {
                      propertyName: 'external_number_or_boolean',
                      type: 'union-type',
                      value: [
                        {
                          type: 'number',
                        },
                        {
                          type: 'boolean',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'object',
              value: [
                {
                  propertyName: 'props_string_literal',
                  type: 'union-type',
                  value: [
                    {
                      type: 'string-literal',
                      value: 'string_1',
                    },
                    {
                      type: 'string-literal',
                      value: 'string_2',
                    },
                  ],
                },
                {
                  propertyName: 'props_number_literal',
                  type: 'union-type',
                  value: [
                    {
                      type: 'number-literal',
                      value: 25,
                    },
                    {
                      type: 'number-literal',
                      value: 50,
                    },
                  ],
                },
              ],
            },
            {
              type: 'object',
              value: [
                {
                  propertyName: 'props_bigint_literal',
                  type: 'union-type',
                  value: [
                    {
                      type: 'bigint-literal',
                      value: 25n,
                    },
                    {
                      type: 'bigint-literal',
                      value: 100n,
                    },
                  ],
                },
                {
                  propertyName: 'props_array_or_set',
                  type: 'union-type',
                  value: [
                    {
                      nodeText: 'boolean[]',
                      type: 'array',
                      value: [
                        {
                          type: 'boolean',
                        },
                      ],
                    },
                    {
                      type: 'not-parsed',
                      value: 'Set<string>',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
    }
  });
});
