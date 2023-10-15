import path from 'path';
import { findTsNodeInFile } from '../../../findTsNodeInFile';
import { parse } from '../../parse';
import { testCompilerOptions } from '../../testCompilerOptions';
import { ParsedProperty } from '../../types';
import { getPropertyNode } from '../getPropertyNode';
import { PrimitiveParser } from '../Primitive.parser';

describe('[class] Primitive parser', () => {
  const filePath = path.join(__dirname, 'Primitive.props.ts');
  const _getPropertyNode = (propertyName: string) =>
    getPropertyNode(filePath, propertyName);

  const primitive = new PrimitiveParser(() => undefined);

  test('string property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_string');
    const result = primitive.parse(tsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual([
      {
        propertyName: 'props_string',
        type: 'string',
      },
    ] satisfies ParsedProperty[]);
  });

  test('number property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_number');
    const result = primitive.parse(tsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual([
      {
        propertyName: 'props_number',
        type: 'number',
      },
    ] satisfies ParsedProperty[]);
  });

  test('boolean property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_boolean');
    const result = primitive.parse(tsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual([
      {
        propertyName: 'props_boolean',
        type: 'boolean',
      },
    ] satisfies ParsedProperty[]);
  });

  test('null property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_null');
    const result = primitive.parse(tsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual([
      {
        propertyName: 'props_null',
        type: 'null',
      },
    ] satisfies ParsedProperty[]);
  });

  test('undefined property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_undefined');
    const result = primitive.parse(tsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual([
      {
        propertyName: 'props_undefined',
        optional: true,
        type: 'undefined',
      },
    ] satisfies ParsedProperty[]);
  });

  test('bigint property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_bigint');
    const result = primitive.parse(tsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual([
      {
        propertyName: 'props_bigint',
        type: 'bigint',
      },
    ] satisfies ParsedProperty[]);
  });

  test('symbol property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_symbol');
    const result = primitive.parse(tsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual([
      {
        propertyName: 'props_symbol',
        type: 'symbol',
      },
    ] satisfies ParsedProperty[]);
  });

  test('function property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_function');
    const result = primitive.parse(tsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual([
      {
        propertyName: 'props_function',
        type: 'function',
      },
    ] satisfies ParsedProperty[]);
  });

  test('any property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_any');
    const result = primitive.parse(tsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual([
      {
        propertyName: 'props_any',
        type: 'any',
      },
    ] satisfies ParsedProperty[]);
  });

  test('unknown property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('props_unknown');
    const result = primitive.parse(tsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual([
      {
        propertyName: 'props_unknown',
        type: 'unknown',
      },
    ] satisfies ParsedProperty[]);
  });

  test('full parsed type is parsed correctly', async () => {
    const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
      filePath,
      'Props',
      testCompilerOptions
    ))!;

    const result = parse(propsNode, {
      typeChecker,
      cachedParsedMap: new Map(),
    });
    expect(result).toEqual(expectedResult());

    function expectedResult(): ParsedProperty[] {
      return [
        {
          nodeText: 'Props',
          type: 'object',
          value: [
            {
              propertyName: 'props_string',
              type: 'string',
            },
            {
              propertyName: 'props_number',
              type: 'number',
            },
            {
              propertyName: 'props_boolean',
              type: 'boolean',
            },
            {
              propertyName: 'props_null',
              type: 'null',
            },
            {
              optional: true,
              propertyName: 'props_undefined',
              type: 'undefined',
            },
            {
              propertyName: 'props_bigint',
              type: 'bigint',
            },
            {
              propertyName: 'props_symbol',
              type: 'symbol',
            },
            {
              propertyName: 'props_function',
              type: 'function',
            },
            {
              propertyName: 'props_any',
              type: 'any',
            },
            {
              propertyName: 'props_unknown',
              type: 'unknown',
            },
          ],
        },
      ];
    }
  });
});
