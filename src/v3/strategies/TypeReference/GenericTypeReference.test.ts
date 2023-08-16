import path from 'path';
import { getPropertyNode } from '../getPropertyNode';
import { GenericTypeReferenceParser } from './GenericTypeReference.parser';

describe('[class] GenericTypeReference parser', () => {
  const filePath = path.join(__dirname, 'GenericTypeReference.props.ts');
  const _getPropertyNode = (propertyName: string) =>
    getPropertyNode(filePath, propertyName);

  const genericTypeReference = new GenericTypeReferenceParser((tsNode) => [
    { type: 'mocked_string' as 'string' },
  ]);

  test.each([
    ['string[]', 'arrayNode'],
    ['readonly string[]', 'readonlyArrayNode'],
    ['Array<string>', 'arrayReferenceNode'],
    ['ReadonlyArray<string>', 'readonlyArrayReferenceNode'],
  ])('%s property is parsed correctly', async (_, propertyName) => {
    const { tsNode, typeChecker } = await _getPropertyNode(propertyName);
    const result = genericTypeReference.parse(tsNode, { typeChecker });
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
