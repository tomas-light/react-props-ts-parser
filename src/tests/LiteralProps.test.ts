import path from 'path';
import { parsePropsInFile } from '../parsePropsInFile';
import { ObjectParsedProperties } from '../ParsedProperty';
import { compilerOptions } from './compilerOptions';
import { Props } from './LiteralProps';

describe('[literals]', () => {
  const componentPath = path.join(__dirname, 'LiteralProps.tsx');
  const result = parsePropsInFile(componentPath, compilerOptions);
  const parsed = result.parsed as ObjectParsedProperties;

  test('props_string', () => {
    expect(parsed?.['props_string']).toEqual({
      type: 'string-literal',
      value: 'string_1' satisfies Props['props_string'],
    });
  });
  test('props_number', () => {
    expect(parsed?.['props_number']).toEqual({
      type: 'number-literal',
      value: 25 satisfies Props['props_number'],
    });
  });
  test('props_bigint', () => {
    expect(parsed?.['props_bigint']).toEqual({
      type: 'bigint-literal',
      value: 25n satisfies Props['props_bigint'],
    });
  });
  test('props_boolean_true', () => {
    expect(parsed?.['props_boolean_true']).toEqual({
      type: 'boolean-literal',
      value: true satisfies Props['props_boolean_true'],
    });
  });
  test('props_boolean_false', () => {
    expect(parsed?.['props_boolean_false']).toEqual({
      type: 'boolean-literal',
      value: false satisfies Props['props_boolean_false'],
    });
  });
});
