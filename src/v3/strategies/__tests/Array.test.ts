import path from 'path';
import { parse } from '../../parse';
import { getPropertyNode } from '../getPropertyNode';

describe('[class] Array parser', () => {
  const filePath = path.join(__dirname, 'Array.props.ts');
  const _getPropertyNode = (propertyName: string) =>
    getPropertyNode(filePath, propertyName);

  test.each([
    ['string[]', 'arrayNode'],
    ['readonly string[]', 'readonlyArrayNode'],
    ['Array<string>', 'arrayReferenceNode'],
    ['ReadonlyArray<string>', 'readonlyArrayReferenceNode'],
  ])('%s property is parsed correctly', async (_, propertyName) => {
    const { tsNode, typeChecker } = await _getPropertyNode(propertyName);
    const result = parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        propertyName,
        type: 'array',
        value: [
          {
            type: 'string',
          },
        ],
      },
    ]);
  });
});
