import path from 'path';
import { parsePropsInFile } from '../parsePropsInFile';
import { compilerOptions } from './compilerOptions';
import { Props } from './SimpleProps';

describe('[primitives]', () => {
  const componentPath = path.join(__dirname, 'SimpleProps.tsx');
  const { parsed } = parsePropsInFile(componentPath, compilerOptions);

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
});
