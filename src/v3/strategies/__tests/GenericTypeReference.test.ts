import path from 'path';
import { findTsNodeInFile } from '../../../findTsNodeInFile';
import { parse } from '../../parse';
import { testCompilerOptions } from '../../testCompilerOptions';
import { ParsedProperty } from '../../types';
import { flatProperties } from './flatProperties';

describe('[class] GenericTypeReference parser', () => {
  const filePath = path.join(__dirname, 'GenericTypeReference.props.ts');

  test('temp', async () => {
    const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
      filePath,
      'Props',
      testCompilerOptions
    ))!;

    const result = parse(propsNode, { typeChecker });
    const properties = flatProperties(result);
    const targetProperty = properties.find(
      (parsedProperty) => parsedProperty!.propertyName === 'props_id_constraint'
    );
    expect(targetProperty).toEqual([
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
