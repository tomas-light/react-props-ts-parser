import path from 'path';
import { ObjectParsedProperties, ParsedProperty } from '../ParsedProperty';
import { parsePropsInFile } from '../parsePropsInFile';
import { compilerOptions } from './compilerOptions';

describe('[union types]', () => {
  const componentPath = path.join(__dirname, 'UnionProps.tsx');
  const result = parsePropsInFile(componentPath, compilerOptions);
  const parsed = result.parsed as ObjectParsedProperties;

  test('props_string', () => {
    expect(parsed?.['props_string']).toEqual({
      type: 'union-type',
      values: [
        {
          type: 'string-literal',
          value: 'string_1',
        },
        {
          type: 'string-literal',
          value: 'string_2',
        },
      ],
    } satisfies ParsedProperty);
  });

  test('props_number', () => {
    expect(parsed?.['props_number']).toEqual({
      type: 'union-type',
      values: [
        {
          type: 'number-literal',
          value: 25,
        },
        {
          type: 'number-literal',
          value: 50,
        },
      ],
    } satisfies ParsedProperty);
  });

  test('props_bigint', () => {
    expect(parsed?.['props_bigint']).toEqual({
      type: 'union-type',
      values: [
        {
          type: 'bigint-literal',
          value: 25n,
        },
        {
          type: 'bigint-literal',
          value: 100n,
        },
      ],
    } satisfies ParsedProperty);
  });

  test('props_arrayOrSet', () => {
    expect(parsed?.['props_arrayOrSet']).toEqual({
      type: 'union-type',
      values: [
        {
          type: 'array',
          values: [
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
    } satisfies ParsedProperty);
  });
});
