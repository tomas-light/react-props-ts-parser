import path from 'path';
import ts from 'typescript';
import { findPropertyTsNodeInFile } from '../../findPropertyTsNodeInFile';
import { compilerOptions } from '../../tests/compilerOptions';
import { primitive } from './primitive';

describe('[function] primitive parser', () => {
  async function getPropertyNode(propertyName: string) {
    const filePath = path.join(__dirname, 'primitive.props.ts');
    return (await findPropertyTsNodeInFile(propertyName, {
      filePath,
      nodeName: 'Props',
      compilerOptions,
    })) as ts.Node;
  }

  test('string property is parsed correctly', async () => {
    const propertyNode = await getPropertyNode('props_string');
    const result = primitive.parse(propertyNode);
    expect(result).toEqual([
      {
        type: 'string',
      },
    ]);
  });

  test('number property is parsed correctly', async () => {
    const propertyNode = await getPropertyNode('props_number');
    const result = primitive.parse(propertyNode);
    expect(result).toEqual([
      {
        type: 'number',
      },
    ]);
  });

  test('boolean property is parsed correctly', async () => {
    const propertyNode = await getPropertyNode('props_boolean');
    const result = primitive.parse(propertyNode);
    expect(result).toEqual([
      {
        type: 'boolean',
      },
    ]);
  });

  test('null property is parsed correctly', async () => {
    const propertyNode = await getPropertyNode('props_null');
    const result = primitive.parse(propertyNode);
    expect(result).toEqual([
      {
        type: 'null',
      },
    ]);
  });

  test('undefined property is parsed correctly', async () => {
    const propertyNode = await getPropertyNode('props_undefined');
    const result = primitive.parse(propertyNode);
    expect(result).toEqual([
      {
        type: 'undefined',
      },
    ]);
  });

  test('bigint property is parsed correctly', async () => {
    const propertyNode = await getPropertyNode('props_bigint');
    const result = primitive.parse(propertyNode);
    expect(result).toEqual([
      {
        type: 'bigint',
      },
    ]);
  });

  test('symbol property is parsed correctly', async () => {
    const propertyNode = await getPropertyNode('props_symbol');
    const result = primitive.parse(propertyNode);
    expect(result).toEqual([
      {
        type: 'symbol',
      },
    ]);
  });

  test('function property is parsed correctly', async () => {
    const propertyNode = await getPropertyNode('props_function');
    const result = primitive.parse(propertyNode);
    expect(result).toEqual([
      {
        type: 'function',
      },
    ]);
  });

  test('any property is parsed correctly', async () => {
    const propertyNode = await getPropertyNode('props_any');
    const result = primitive.parse(propertyNode);
    expect(result).toEqual([
      {
        type: 'any',
      },
    ]);
  });

  test('unknown property is parsed correctly', async () => {
    const propertyNode = await getPropertyNode('props_unknown');
    const result = primitive.parse(propertyNode);
    expect(result).toEqual([
      {
        type: 'unknown',
      },
    ]);
  });
});
