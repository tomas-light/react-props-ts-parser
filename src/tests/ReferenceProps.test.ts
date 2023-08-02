import path from 'path';
import { ObjectParsedProperties, ParsedProperty } from '../ParsedProperty';
import { parsePropsInFile } from '../parsePropsInFile';
import { compilerOptions } from './compilerOptions';

describe('[reference types]', () => {
  const componentPath = path.join(__dirname, 'ReferenceProps.tsx');
  const result = parsePropsInFile(componentPath, compilerOptions);
  const parsed = result.parsed as ObjectParsedProperties;

  test('props_object', () => {
    expect(parsed?.['props_object']).toEqual({
      type: 'object',
      value: {
        someData: {
          type: 'any',
        },
      },
    } satisfies ParsedProperty);
  });

  test('props_objectArray', () => {
    expect(parsed?.['props_objectArray']).toEqual({
      type: 'array',
      values: [
        {
          type: 'object',
          value: {
            someDataInArray: {
              type: 'any',
            },
          },
        },
      ],
    } satisfies ParsedProperty);
  });

  test('props_objectRef', () => {
    expect(parsed?.['props_objectRef']).toEqual({
      type: 'object',
      value: {
        someData: {
          type: 'any',
        },
      },
    } satisfies ParsedProperty);
  });

  test('props_unionTypeRef', () => {
    expect(parsed?.['props_unionTypeRef']).toEqual({
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
    } satisfies ParsedProperty);
  });

  test('props_dayjs', () => {
    expect(parsed?.['props_dayjs']).toEqual({
      type: 'imported-type',
      value: 'Dayjs',
    } satisfies ParsedProperty);
  });

  test('props_localImportedType', () => {
    expect(parsed?.['props_localImportedType']).toEqual({
      type: 'union-type',
      values: [
        {
          type: 'number',
        },
        {
          type: 'object',
          value: {
            fruit: {
              type: 'string',
            },
          },
        },
      ],
    } satisfies ParsedProperty);
  });
});
