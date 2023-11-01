import path from 'path';
import { ParsedProperty } from '../../types';
import { Props } from './Array.props';
import { findPropertyByName } from './utils/findPropertyByName';
import { onceParsing } from './utils/onceParsing';

describe('[class] Array parser', () => {
  const filePath = path.join(__dirname, 'Array.props.ts');

  const _parse = onceParsing(filePath);

  test('arrayNode property is parsed correctly', async () => {
    const parsedProperties = await _parse();
    const property = findPropertyByName<Props>(parsedProperties, 'arrayNode');

    expect(property).toEqual({
      propertyName: 'arrayNode',
      nodeText: 'string[]',
      type: 'array',
      value: [
        {
          type: 'string',
        },
      ],
    } satisfies ParsedProperty);
  });

  test('readonlyArrayNode property is parsed correctly', async () => {
    const parsedProperties = await _parse();
    const property = findPropertyByName<Props>(
      parsedProperties,
      'readonlyArrayNode'
    );

    expect(property).toEqual({
      propertyName: 'readonlyArrayNode',
      nodeText: 'string[]',
      type: 'array',
      value: [
        {
          type: 'string',
        },
      ],
    } satisfies ParsedProperty);
  });

  test('arrayReferenceNode property is parsed correctly', async () => {
    const parsedProperties = await _parse();
    const property = findPropertyByName<Props>(
      parsedProperties,
      'arrayReferenceNode'
    );

    expect(property).toEqual({
      propertyName: 'arrayReferenceNode',
      nodeText: 'Array<string>',
      type: 'array',
      value: [
        {
          type: 'string',
        },
      ],
    } satisfies ParsedProperty);
  });

  test('readonlyArrayReferenceNode property is parsed correctly', async () => {
    const parsedProperties = await _parse();
    const property = findPropertyByName<Props>(
      parsedProperties,
      'readonlyArrayReferenceNode'
    );

    expect(property).toEqual({
      propertyName: 'readonlyArrayReferenceNode',
      nodeText: 'ReadonlyArray<string>',
      type: 'array',
      value: [
        {
          type: 'string',
        },
      ],
    } satisfies ParsedProperty);
  });

  test('full parsed type is parsed correctly', async () => {
    const result = await _parse();
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
