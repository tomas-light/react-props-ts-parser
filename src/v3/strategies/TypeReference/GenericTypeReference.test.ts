import path from 'path';
import { ParsedProperty } from '../../types';
import { getPropertyNode } from '../getPropertyNode';
import { GenericTypeReferenceParser } from './GenericTypeReference.parser';

describe('[class] GenericTypeReference parser', () => {
  const filePath = path.join(__dirname, 'GenericTypeReference.props.ts');
  const _getPropertyNode = (propertyName: string) =>
    getPropertyNode(filePath, propertyName);

  const genericTypeReference = new GenericTypeReferenceParser((tsNode) => [
    { type: 'mocked_string' as 'string' },
  ]);

  test('temp', async () => {
    const { tsNode, typeChecker } = await _getPropertyNode(
      'props_id_constraint'
    );
    const result = genericTypeReference.parse(tsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'generic-constraint',
        value: [
          {
            type: 'union-type',
            value: [
              {
                type: 'string-literal',
                value: 'prop_a',
              },
              {
                type: 'string-literal',
                value: 'prob_b',
              },
            ],
          },
        ],
      },
    ] satisfies ParsedProperty[]);
  });
});
