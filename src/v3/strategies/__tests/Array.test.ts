import path from 'path';
import { findTsNodeInFile } from '../../../findTsNodeInFile';
import { parse } from '../../parse';
import { testCompilerOptions } from '../../testCompilerOptions';
import { ParsedProperty } from '../../types';
import { getPropertyNode } from '../getPropertyNode';

describe('[class] Array parser', () => {
  const filePath = path.join(__dirname, 'Array.props.ts');
  const _getPropertyNode = (propertyName: string) =>
    getPropertyNode(filePath, propertyName);

  test('arrayNode property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('arrayNode');
    const result = parse(tsNode, { typeChecker, nodeCacheMap: new Map() });
    expect(result).toEqual([
      {
        propertyName: 'arrayNode',
        nodeText: 'string[]',
        type: 'array',
        value: [
          {
            type: 'string',
          },
        ],
      },
    ]);
  });

  test('readonlyArrayNode property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode('readonlyArrayNode');
    const result = parse(tsNode, { typeChecker, nodeCacheMap: new Map() });
    expect(result).toEqual([
      {
        propertyName: 'readonlyArrayNode',
        nodeText: 'string[]',
        type: 'array',
        value: [
          {
            type: 'string',
          },
        ],
      },
    ]);
  });

  test('arrayReferenceNode property is parsed correctly', async () => {
    const { tsNode, typeChecker } =
      await _getPropertyNode('arrayReferenceNode');
    const result = parse(tsNode, { typeChecker, nodeCacheMap: new Map() });
    expect(result).toEqual([
      {
        propertyName: 'arrayReferenceNode',
        nodeText: 'Array<string>',
        type: 'array',
        value: [
          {
            type: 'string',
          },
        ],
      },
    ]);
  });

  test('readonlyArrayReferenceNode property is parsed correctly', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode(
      'readonlyArrayReferenceNode'
    );
    const result = parse(tsNode, { typeChecker, nodeCacheMap: new Map() });
    expect(result).toEqual([
      {
        propertyName: 'readonlyArrayReferenceNode',
        nodeText: 'ReadonlyArray<string>',
        type: 'array',
        value: [
          {
            type: 'string',
          },
        ],
      },
    ]);
  });

  test('full parsed type is parsed correctly', async () => {
    const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
      filePath,
      'Props',
      testCompilerOptions
    ))!;

    const result = parse(propsNode, {
      typeChecker,
      nodeCacheMap: new Map(),
    });
    expect(result).toEqual(expectedResult());

    function expectedResult(): ParsedProperty[] {
      return [
        {
          nodeText: 'Props',
          type: 'object',
          value: [
            {
              nodeText: 'string[]',
              propertyName: 'arrayNode',
              type: 'array',
              value: [
                {
                  type: 'string',
                },
              ],
            },
            {
              nodeText: 'string[]',
              propertyName: 'readonlyArrayNode',
              type: 'array',
              value: [
                {
                  type: 'string',
                },
              ],
            },
            {
              nodeText: 'Array<string>',
              propertyName: 'arrayReferenceNode',
              type: 'array',
              value: [
                {
                  type: 'string',
                },
              ],
            },
            {
              nodeText: 'ReadonlyArray<string>',
              propertyName: 'readonlyArrayReferenceNode',
              type: 'array',
              value: [
                {
                  type: 'string',
                },
              ],
            },
          ],
        },
      ];
    }
  });
});
