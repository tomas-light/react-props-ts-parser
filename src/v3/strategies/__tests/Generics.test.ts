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
    [propertyName in keyof Props<any, any, any>]: [string, ParsedProperty[]];
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
    name: [
      'Inherited properties are parsed correctly despite on generic arguments and so on',
      [
        {
          propertyName: 'name',
          type: 'string',
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
          nodeText: 'Value[]',
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
          nodeText: 'Option',
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
          nodeText: 'MultiOption',
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
          nodeText: 'MultiOption',
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
          nodeText: "Pick<Custom<{ id: Id }>, 'id' | 'info'>",
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
          nodeText: "Pick<Custom<{ id: Id }>, 'id' | 'info'>",
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

      const result = parse(propsNode, {
        typeChecker,
        cachedParsedMap: new Map(),
      });
      const properties = flatProperties(result);
      const targetProperty = properties.filter(
        (parsedProperty) => parsedProperty!.propertyName === propertyName
      );
      expect(targetProperty).toEqual(expectedValue);
    }
  );

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
        },
        {
          nodeText: 'Props',
          type: 'object',
          value: [
            {
              propertyName: 'name',
              type: 'string',
            },
          ],
        },
        {
          nodeText: 'Props',
          type: 'object',
          value: [
            {
              propertyName: 'props_id_constraint',
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
            },
            {
              propertyName: 'props_value',
              type: 'generic-constraint',
              value: 'Value',
            },
            {
              nodeText: 'Value[]',
              propertyName: 'props_array',
              type: 'array',
              value: [
                {
                  type: 'generic-constraint',
                  value: 'Value',
                },
              ],
            },
            {
              nodeText: 'Option',
              propertyName: 'props_option',
              type: 'object',
              value: [
                {
                  propertyName: 'label',
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
            {
              nodeText: 'MultiOption',
              propertyName: 'props_multi_option',
              type: 'object',
              value: [
                {
                  propertyName: 'label',
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
                },
                {
                  propertyName: 'value',
                  type: 'bigint',
                },
              ],
            },
            {
              nodeText: 'MultiOption',
              propertyName: 'props_multi_option',
              type: 'object',
              value: [
                {
                  propertyName: 'multi_value',
                  type: 'number',
                },
              ],
            },
            {
              nodeText: "Pick<Custom<{ id: Id }>, 'id' | 'info'>",
              propertyName: 'props_custom_object',
              type: 'object',
              value: [
                {
                  propertyName: 'id',
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
                },
              ],
            },
            {
              nodeText: "Pick<Custom<{ id: Id }>, 'id' | 'info'>",
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
        },
      ];
    }
  });
});
