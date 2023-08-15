import path from 'path';
import { ParsedProperty } from '../../ParsedProperty';
import { getPropertyNode } from './getPropertyNode';
import { PrimitiveParser } from './Primitive.parser';

describe('[class] Primitive parser', () => {
  const filePath = path.join(__dirname, 'Primitive.props.ts');
  const _getPropertyNode = (propertyName: string) =>
    getPropertyNode(filePath, propertyName);

  const primitive = new PrimitiveParser(() => undefined);

  test('string property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_string');
    const result = primitive.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'string',
      },
    ] satisfies ParsedProperty[]);
  });

  test('number property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_number');
    const result = primitive.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'number',
      },
    ] satisfies ParsedProperty[]);
  });

  test('boolean property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_boolean');
    const result = primitive.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'boolean',
      },
    ] satisfies ParsedProperty[]);
  });

  test('null property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_null');
    const result = primitive.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'null',
      },
    ] satisfies ParsedProperty[]);
  });

  test('undefined property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_undefined');
    const result = primitive.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'undefined',
      },
    ] satisfies ParsedProperty[]);
  });

  test('bigint property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_bigint');
    const result = primitive.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'bigint',
      },
    ] satisfies ParsedProperty[]);
  });

  test('symbol property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_symbol');
    const result = primitive.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'symbol',
      },
    ] satisfies ParsedProperty[]);
  });

  test('function property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_function');
    const result = primitive.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'function',
      },
    ] satisfies ParsedProperty[]);
  });

  test('any property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_any');
    const result = primitive.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'any',
      },
    ] satisfies ParsedProperty[]);
  });

  test('unknown property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_unknown');
    const result = primitive.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'unknown',
      },
    ] satisfies ParsedProperty[]);
  });
});
