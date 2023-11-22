import path from 'path';
import { ParsedProperty } from '../../types';
import { flatAndFilterPropertyByName } from './utils/findPropertyByName';
import { onceParsing } from './utils/onceParsing';

describe('[class] TypeReference parser for generics', () => {
  const filePath = path.join(__dirname, 'Generics.props.ts');

  const _parse = onceParsing(filePath);

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

  test('Inherited properties are parsed correctly despite on generic arguments and so on', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'variant');
    expect(property).toEqual([
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
    ] satisfies ParsedProperty[]);
  });

  test('Inherited properties are parsed correctly despite on generic arguments and so on', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'name');
    expect(property).toEqual([
      {
        propertyName: 'name',
        type: 'string',
      },
    ] satisfies ParsedProperty[]);
  });

  test('Generic argument Id with constraints: constraint is taken for parsed property', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_id_constraint');
    expect(property).toEqual([
      {
        ...parsedId,
        propertyName: 'props_id_constraint',
      },
    ] satisfies ParsedProperty[]);
  });

  test('Generic argument Value: "Value" is used as parsed property value with type "generic-constraint"', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_value');
    expect(property).toEqual([
      {
        propertyName: 'props_value',
        type: 'generic-constraint',
        value: 'Value',
      },
    ] satisfies ParsedProperty[]);
  });

  test('Generic argument Value: "Value[]" is parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_array');
    expect(property).toEqual([
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
    ] satisfies ParsedProperty[]);
  });

  test('Generics passed to next generic type thet inherits third generic type: "MultiOption<Id, MultiValue>" parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_multi_option');
    expect(property).toEqual([
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
    ] satisfies ParsedProperty[]);
  });

  test('Generics passed to next generic type thet inherits third generic type: "MultiOption<Id, MultiValue>" parsed correctly', async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_multi_option');
    expect(property).toEqual([
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
    ] satisfies ParsedProperty[]);
  });

  test("Generics passed to next generic with object nexted property as generic: Pick<Custom<{ id: Id }>, 'id' | 'info'> is parsed correctly", async () => {
    const result = await _parse();
    if (!result) {
      expect(result).not.toBeUndefined();
      return;
    }

    const property = flatAndFilterPropertyByName(result, 'props_custom_object');
    expect(property).toEqual([
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
    ] satisfies ParsedProperty[]);
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
