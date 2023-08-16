import path from 'path';
import { ParsedIntersectionType, ParsedProperty } from '../ParsedProperty';
import { parsePropsInFile } from '../parsePropsInFile';
import { compilerOptions } from './compilerOptions';

describe('[intersection types]', () => {
  const componentPath = path.join(__dirname, 'IntersectionProps.tsx');
  const { parsed } = parsePropsInFile(componentPath, compilerOptions);

  const parsedIntersection = parsed as ParsedIntersectionType | undefined;

  test('self props_string', () => {
    expect(parsedIntersection?.value?.self?.value?.['props_string']).toEqual({
      type: 'string-literal',
      value: 'string_1',
    } satisfies ParsedProperty);
  });

  test('self props_number', () => {
    expect(parsedIntersection?.value?.self?.value?.['props_number']).toEqual({
      type: 'number-literal',
      value: 25,
    } satisfies ParsedProperty);
  });

  test('self lastOne', () => {
    expect(parsedIntersection?.value?.self?.value?.['lastOne']).toEqual({
      type: 'boolean',
    } satisfies ParsedProperty);
  });

  test('inherited', () => {
    expect(parsedIntersection?.value?.inherited).toEqual([
      {
        type: 'imported-type',
        value: 'HTMLAttributes<HTMLDivElement>',
      },
      {
        type: 'object',
        value: {
          another: {
            type: 'string',
          },
          some: {
            type: 'number',
          },
        },
      },
    ] satisfies ParsedProperty[]);
  });
});
