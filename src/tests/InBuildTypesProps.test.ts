import path from 'path';
import { ParsedIntersectionType, ParsedProperty } from '../ParsedProperty';
import { parsePropsInFile } from '../parsePropsInFile';
import { compilerOptions } from './compilerOptions';

describe('[in-build types]', () => {
  const componentPath = path.join(__dirname, 'InBuildTypesProps.tsx');
  const { parsed } = parsePropsInFile(componentPath, compilerOptions);

  const parsedIntersection = parsed as ParsedIntersectionType | undefined;

  test('self props_string', () => {
    expect(parsedIntersection?.value?.self?.value?.['props_string']).toEqual({
      type: 'string',
    } satisfies ParsedProperty);
  });

  test('self props_set', () => {
    expect(parsedIntersection?.value?.self?.value?.['props_set']).toEqual({
      type: 'not-parsed',
      value: 'Set<string>',
    } satisfies ParsedProperty);
  });

  test('self props_map', () => {
    expect(parsedIntersection?.value?.self?.value?.['props_map']).toEqual({
      type: 'not-parsed',
      value: 'Map<number, boolean>',
    } satisfies ParsedProperty);
  });

  test('inherited', () => {
    expect(parsedIntersection?.value?.inherited).toEqual([
      {
        type: 'object',
        value: {
          another: {
            type: 'string',
            optional: true,
          },
          prop3: {
            type: 'bigint',
            optional: true,
          },
          some: {
            type: 'number',
            optional: true,
          },
        },
      },
    ] satisfies ParsedProperty[]);
  });
});
