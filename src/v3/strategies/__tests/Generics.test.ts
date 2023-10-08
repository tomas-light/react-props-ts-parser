import path from 'path';
import { findTsNodeInFile } from '../../../findTsNodeInFile';
import { parse } from '../../parse';
import { testCompilerOptions } from '../../testCompilerOptions';
import { ParsedProperty } from '../../types';
import { flatProperties } from './flatProperties';
import { Props } from './Generics.props';

describe('[class] TypeReference parser for generics', () => {
  const filePath = path.join(__dirname, 'Generics.props.ts');

  const parsedId: ParsedProperty = {
    type: 'union-type',
    value: [
      {
        type: 'string-literal',
        value: 'prop_a',
      },
      {
        type: 'string-literal',
        value: 'prop_b',
      },
    ],
  };

  const expected: {
    [propertyName in keyof Props<any, any, any>]?: [string, ParsedProperty[]];
  } = {
    variant: [
      'Inherited properties are parsed correctly despite on generic arguments and so on',
      [
        {
          propertyName: 'variant',
          type: 'union-type',
          value: [
            {
              type: 'string-literal',
              value: 'a',
            },
            {
              type: 'string-literal',
              value: 'b',
            },
          ],
        },
      ],
    ],
    props_id_constraint: [
      'Generic argument Id with constraints: constraint is taken for parsed property',
      [
        {
          ...parsedId,
          propertyName: 'props_id_constraint',
        },
      ],
    ],
    props_value: [
      'Generic argument Value: "Value" is used as parsed property value with type "generic-constraint"',
      [
        {
          propertyName: 'props_value',
          type: 'generic-constraint',
          value: 'Value',
        },
      ],
    ],
    props_array: [
      'Generic argument Value: "Value[]" is parsed correctly',
      [
        {
          propertyName: 'props_array',
          type: 'array',
          value: [
            {
              type: 'generic-constraint',
              value: 'Value',
            },
          ],
        },
      ],
    ],
    props_option: [
      "Generics passed to next generic type: \"Option<Id, 'id_100' | 'id_200'>\" is parsed correctly",
      [
        {
          propertyName: 'props_option',
          type: 'object',
          value: [
            {
              ...parsedId,
              propertyName: 'label',
            },
            {
              propertyName: 'value',
              type: 'union-type',
              value: [
                {
                  type: 'string-literal',
                  value: 'id_100',
                },
                {
                  type: 'string-literal',
                  value: 'id_200',
                },
              ],
            },
          ],
        },
      ],
    ],
    props_multi_option: [
      'Generics passed to next generic type thet inherits third generic type: "MultiOption<Id, MultiValue>" parsed correctly',
      [
        {
          propertyName: 'props_multi_option',
          type: 'object',
          value: [
            {
              ...parsedId,
              propertyName: 'label',
            },
            {
              propertyName: 'value',
              type: 'bigint',
            },
          ],
        },
        {
          propertyName: 'props_multi_option',
          type: 'object',
          value: [
            {
              propertyName: 'multi_value',
              type: 'number',
            },
          ],
        },
      ],
    ],
    props_custom_object: [
      "Generics passed to next generic with object nexted property as generic: Pick<Custom<{ id: Id }>, 'id' | 'info'> is parsed correctly",
      [
        {
          propertyName: 'props_custom_object',
          type: 'object',
          value: [
            {
              ...parsedId,
              propertyName: 'id',
            },
          ],
        },
        {
          propertyName: 'props_custom_object',
          type: 'object',
          value: [
            {
              optional: true,
              propertyName: 'info',
              type: 'string',
            },
          ],
        },
      ],
    ],
  };

  test.each(Object.entries(expected))(
    '%s',
    async (propertyName, [, expectedValue]) => {
      const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
        filePath,
        'Props',
        testCompilerOptions
      ))!;

      const result = parse(propsNode, { typeChecker });
      const properties = flatProperties(result);
      const targetProperty = properties.filter(
        (parsedProperty) => parsedProperty!.propertyName === propertyName
      );
      expect(targetProperty).toEqual(expectedValue);
    }
  );
});

// describe('[class] GenericTypeReference parser', () => {
//   const filePath = path.join(__dirname, 'GenericTypeReference.props.ts');
//
//   test('temp', async () => {
//     const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
//       filePath,
//       'Props',
//       testCompilerOptions
//     ))!;
//
//     const result = parse(propsNode, { typeChecker });
//     const properties = flatProperties(result);
//     const targetProperty = properties.find(
//       (parsedProperty) => parsedProperty!.propertyName === 'props_id_constraint'
//     );
//     expect(targetProperty).toEqual([
//       {
//         type: 'generic-constraint',
//         value: [
//           {
//             type: 'union-type',
//             value: [
//               {
//                 type: 'string-literal',
//                 value: 'prop_a',
//               },
//               {
//                 type: 'string-literal',
//                 value: 'prob_b',
//               },
//             ],
//           },
//         ],
//       },
//     ] satisfies ParsedProperty[]);
//   });
// });
