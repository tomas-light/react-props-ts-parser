import path from 'path';
import { ParsedProperty } from '../ParsedProperty';
import { parsePropsInFile } from '../parsePropsInFile';
import { compilerOptions } from './compilerOptions';

describe('[generic types]', () => {
  const componentPath = path.join(__dirname, 'GenericProps.tsx');
  const { parsed } = parsePropsInFile(componentPath, compilerOptions);

  test('props_set', () => {
    expect(parsed?.['props_set']).toEqual({
      type: 'not-parsed',
      value: 'Set<number>',
    } satisfies ParsedProperty);
  });

  test('props_map', () => {
    expect(parsed?.['props_map']).toEqual({
      type: 'not-parsed',
      value: 'Map<number, Item>',
    } satisfies ParsedProperty);
  });

  test('props_array', () => {
    expect(parsed?.['props_array']).toEqual({
      type: 'array',
      values: [
        {
          type: 'object',
          value: {
            age: {
              type: 'number',
            },
            name: {
              type: 'string',
            },
          },
        },
      ],
    } satisfies ParsedProperty);
  });

  test('props_id_constraint', () => {
    expect(parsed?.['props_id_constraint']).toEqual({
      type: 'generic-constraint',
      value: 'string',
    } satisfies ParsedProperty);
  });

  test('props_value', () => {
    expect(parsed?.['props_value']).toEqual({
      type: 'generic-constraint',
      value: 'Value',
    } satisfies ParsedProperty);
  });

  test('props_option', () => {
    expect(parsed?.['props_option']).toEqual({
      type: 'object',
      value: {
        label: {
          type: 'union-type',
          values: [
            {
              type: 'string-literal',
              value: 'a',
            },
            {
              type: 'string-literal',
              value: 'b',
            },
            {
              type: 'string-literal',
              value: 'c',
            },
          ],
        },
        value: {
          type: 'union-type',
          values: [
            {
              type: 'string-literal',
              value: 'propA',
            },
            {
              type: 'string-literal',
              value: 'propB',
            },
            {
              type: 'string-literal',
              value: 'propC',
            },
          ],
        },
      },
    } satisfies ParsedProperty);
  });
});
