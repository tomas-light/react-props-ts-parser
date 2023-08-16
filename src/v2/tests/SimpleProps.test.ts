import path from 'path';
import { parsePropsInFile } from '../parsePropsInFile';
import { ObjectParsedProperties } from '../ParsedProperty';
import { compilerOptions } from './compilerOptions';

describe('[primitives]', () => {
  const componentPath = path.join(__dirname, 'SimpleProps.tsx');
  const result = parsePropsInFile(componentPath, compilerOptions);
  const parsed = result.parsed as ObjectParsedProperties;

  test('props_string', () => {
    expect(parsed?.['props_string']).toEqual({
      type: 'string',
    });
  });
  test('props_number', () => {
    expect(parsed?.['props_number']).toEqual({
      type: 'number',
    });
  });
  test('props_boolean', () => {
    expect(parsed?.['props_boolean']).toEqual({
      type: 'boolean',
    });
  });
  test('props_null', () => {
    expect(parsed?.['props_null']).toEqual({
      type: 'null',
    });
  });
  test('props_undefined', () => {
    expect(parsed?.['props_undefined']).toEqual({
      type: 'undefined',
    });
  });
  test('props_bigint', () => {
    expect(parsed?.['props_bigint']).toEqual({
      type: 'bigint',
    });
  });
  test('props_symbol', () => {
    expect(parsed?.['props_symbol']).toEqual({
      type: 'symbol',
    });
  });
  test('props_function', () => {
    expect(parsed?.['props_function']).toEqual({
      type: 'function',
    });
  });
  test('props_any', () => {
    expect(parsed?.['props_any']).toEqual({
      type: 'any',
    });
  });
  test('props_unknown', () => {
    expect(parsed?.['props_unknown']).toEqual({
      type: 'unknown',
    });
  });
});
