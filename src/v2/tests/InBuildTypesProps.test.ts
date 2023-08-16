import path from 'path';
import {
  ObjectParsedProperties,
  ParsedIntersectionType,
  ParsedProperty,
} from '../ParsedProperty';
import { parsePropsInFile } from '../parsePropsInFile';
import { compilerOptions } from './compilerOptions';

describe('[in-build types]', () => {
  const componentPath = path.join(__dirname, 'InBuildTypesProps.tsx');
  const { parsed } = parsePropsInFile(componentPath, compilerOptions);

  const parsedIntersection = parsed as ObjectParsedProperties | undefined;

  test('props_partial', () => {
    expect(parsedIntersection?.['props_partial']).toEqual({
      type: 'object',
      value: {
        another: {
          optional: true,
          type: 'string',
        },
        prop3: {
          optional: true,
          type: 'bigint',
        },
        prop4: {
          optional: true,
          type: 'symbol',
        },
        prop5: {
          optional: true,
          type: 'null',
        },
        prop6: {
          optional: true,
          type: 'undefined',
        },
        some: {
          optional: true,
          type: 'number',
        },
      },
    } satisfies ParsedProperty);
  });

  test('props_pick', () => {
    expect(parsedIntersection?.['props_pick']).toEqual({
      type: 'object',
      value: {
        prop3: {
          type: 'bigint',
        },
        prop5: {
          type: 'null',
        },
      },
    } satisfies ParsedProperty);
  });

  test('props_omit', () => {
    expect(parsedIntersection?.['props_omit']).toEqual({
      type: 'object',
      value: {
        prop4: {
          type: 'symbol',
        },
        prop5: {
          type: 'null',
        },
        prop6: {
          type: 'undefined',
        },
      },
    } satisfies ParsedProperty);
  });

  test('props_set', () => {
    expect(parsedIntersection?.['props_set']).toEqual({
      type: 'not-parsed',
      value: 'Set<string>',
    } satisfies ParsedProperty);
  });

  test('props_map', () => {
    expect(parsedIntersection?.['props_map']).toEqual({
      type: 'not-parsed',
      value: 'Map<number, boolean>',
    } satisfies ParsedProperty);
  });
});
