import path from 'path';
import { findTsNodeInFile } from '../../findTsNodeInFile';
import { parse } from '../parse';
import { testCompilerOptions } from '../testCompilerOptions';
import { ParsedProperty } from '../types';
import { flatProperties } from './testUtils/flatProperties';

describe('[class] UnionType parser', () => {
  const filePath = path.join(__dirname, 'UnionType.props.ts');

  const expected = {
    external_optional_string: [
      '1st inherited type: optional string is presented in parsed result and parsed correctly',
      {
        optional: true,
        propertyName: 'external_optional_string',
        type: 'string',
      } satisfies ParsedProperty,
    ] as const,
    external_string: [
      '1st inherited type: string is presented in parsed result and parsed correctly',
      {
        propertyName: 'external_string',
        type: 'string',
      } satisfies ParsedProperty,
    ] as const,
    external_number_or_string: [
      '2nd inherited type (with 3rd type): number or string is presented in parsed result and parsed correctly',
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
      } satisfies ParsedProperty,
    ] as const,
    external_number_or_boolean: [
      '2nd inherited type (with 3rd type): number or boolean is presented in parsed result and parsed correctly',
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
      } satisfies ParsedProperty,
    ] as const,
    external_boolean_or_null: [
      '3rd inherited type: boolean or null is presented in parsed result and parsed correctly',
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
      } satisfies ParsedProperty,
    ] as const,
    external_boolean_or_symbol: [
      '3rd inherited type: boolean or symbol is presented in parsed result and parsed correctly',
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
      } satisfies ParsedProperty,
    ] as const,
    props_string_literal: [
      '1st self type: string union literals are presented in parsed result and parsed correctly',
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
      } satisfies ParsedProperty,
    ] as const,
    props_number_literal: [
      '1st self type: number union literals are presented in parsed result and parsed correctly',
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
      } satisfies ParsedProperty,
    ] as const,
    props_bigint_literal: [
      '2nd self type: bigint union literals are presented in parsed result and parsed correctly',
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
      } satisfies ParsedProperty,
    ] as const,
    props_array_or_set: [
      '2nd self type: array or set are presented in parsed result and parsed correctly',
      {
        propertyName: 'props_array_or_set',
        type: 'union-type',
        value: [
          {
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
      } satisfies ParsedProperty,
    ] as const,
  };

  test.each(Object.entries(expected))(
    '%s',
    async (propertyName, [, expectedValue]) => {
      const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
        filePath,
        'Props',
        testCompilerOptions
      ))!;

      const result = parse(propsNode, { typeChecker });
      const properties = flatProperties(result);
      const targetProperty = properties.find(
        (parsedProperty) => parsedProperty!.propertyName === propertyName
      );
      expect(targetProperty).toEqual(expectedValue);
    }
  );

  test('full parsed type is parsed correctly', async () => {
    const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
      filePath,
      'Props',
      testCompilerOptions
    ))!;

    const result = parse(propsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'union-type',
        value: [
          {
            type: 'object',
            value: [
              expected.external_optional_string[1],
              expected.external_string[1],
            ],
          },
          {
            type: 'union-type',
            value: [
              {
                type: 'object',
                value: [
                  expected.external_boolean_or_null[1],
                  expected.external_boolean_or_symbol[1],
                ],
              },
              {
                type: 'object',
                value: [
                  expected.external_number_or_string[1],
                  expected.external_number_or_boolean[1],
                ],
              },
            ],
          },
          {
            type: 'object',
            value: [
              expected.props_string_literal[1],
              expected.props_number_literal[1],
            ],
          },
          {
            type: 'object',
            value: [
              expected.props_bigint_literal[1],
              expected.props_array_or_set[1],
            ],
          },
        ],
      },
    ] satisfies ParsedProperty[]);
  });
});
