import path from 'path';
import { ArrayParser } from './Array.parser';
import { getPropertyNode } from './getPropertyNode';

describe('[class] Array parser', () => {
  const filePath = path.join(__dirname, 'Array.props.ts');
  const _getPropertyNode = (propertyName: string) =>
    getPropertyNode(filePath, propertyName);

  const array = new ArrayParser((tsNode) => [
    { type: 'mocked_string' as 'string' },
  ]);

  test.each([
    ['string[]', 'arrayNode'],
    ['readonly string[]', 'readonlyArrayNode'],
    ['Array<string>', 'arrayReferenceNode'],
    ['ReadonlyArray<string>', 'readonlyArrayReferenceNode'],
  ])('%s property is parsed correctly', async (_, propertyName) => {
    const { tsNode, typeChecker } = await _getPropertyNode(propertyName);
    const result = array.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'array',
        values: [
          {
            type: 'mocked_string',
          },
        ],
      },
    ]);
  });
});
