import path from 'path';
import { ParsedProperty } from '../../types';
import { Props } from './TypeReference.props';
import { flatAndFilterPropertyByName } from './utils/findPropertyByName';
import { onceParsing } from './utils/onceParsing';

describe('[class] TypeReference parser', () => {
  const filePath = path.join(__dirname, 'TypeReference.props.ts');

  const _parse = onceParsing(filePath);

  async function check(
    propertyName: keyof Props | string,
    expectedValue: ParsedProperty[]
  ) {
    const result = await _parse();
    const targetProperty = flatAndFilterPropertyByName(result, propertyName);
    expect(targetProperty).toEqual(expectedValue);
  }

  test('Partial property is presented in parsed result', async () => {
    await check('props_partial', [
      {
        nodeText: 'Partial<MyTypeC>',
        propertyName: 'props_partial',
        type: 'object',
        value: [
          {
            propertyName: 'some',
            type: 'number',
            optional: true,
          },
          {
            propertyName: 'another',
            type: 'string',
            optional: true,
          },
          {
            propertyName: 'prop3',
            type: 'bigint',
            optional: true,
          },
          {
            propertyName: 'prop4',
            type: 'symbol',
            optional: true,
          },
          {
            propertyName: 'prop5',
            type: 'null',
            optional: true,
          },
          {
            propertyName: 'prop6',
            type: 'undefined',
            optional: true,
          },
        ],
      },
    ]);
  });

  test('Pick property is presented and parsed correctly', async () => {
    await check('props_pick', [
      {
        nodeText: "Pick<MyTypeC, 'prop3' | 'prop5'>",
        propertyName: 'props_pick',
        type: 'object',
        value: [
          {
            propertyName: 'prop3',
            type: 'bigint',
          },
          {
            propertyName: 'prop5',
            type: 'null',
            optional: true,
          },
        ],
      },
    ]);
  });

  test('Omit property is presented and parsed correctly', async () => {
    await check('props_omit', [
      {
        nodeText: "Omit<MyTypeC, 'some' | 'another' | 'prop3'>",
        propertyName: 'props_omit',
        type: 'object',
        value: [
          {
            propertyName: 'prop4',
            type: 'symbol',
          },
          {
            propertyName: 'prop5',
            type: 'null',
            optional: true,
          },
          {
            propertyName: 'prop6',
            type: 'undefined',
          },
        ],
      },
    ]);
  });

  test('Set property is presented and not parsed, but its values is presented', async () => {
    await check('props_set', [
      {
        propertyName: 'props_set',
        type: 'not-parsed',
        value: 'Set<string>',
      },
    ]);
  });

  test('Map property is presented and not parsed, but its values is presented', async () => {
    await check('props_map', [
      {
        propertyName: 'props_map',
        type: 'not-parsed',
        value: 'Map<number, boolean>',
      },
    ]);
  });

  test('Type Literal property is presented and parsed correctly', async () => {
    await check('props_object', [
      {
        propertyName: 'props_object',
        type: 'object',
        value: [
          {
            propertyName: 'someData',
            type: 'any',
          },
        ],
      },
    ]);
  });

  test('Type Literals Array property is presented and parsed correctly', async () => {
    await check('props_objectArray', [
      {
        nodeText: `{
    someDataInArray: any;
  }[]`,
        propertyName: 'props_objectArray',
        type: 'array',
        value: [
          {
            type: 'object',
            value: [
              {
                propertyName: 'someDataInArray',
                type: 'any',
              },
            ],
          },
        ],
      },
    ]);
  });

  test('property referenced on local defined type is presented and parsed correctly', async () => {
    await check('props_objectRef', [
      {
        nodeText: 'MyTypeA',
        propertyName: 'props_objectRef',
        type: 'object',
        value: [
          {
            propertyName: 'someData',
            type: 'any',
          },
        ],
      },
    ]);
  });

  test('property referenced on local defined union type is presented and parsed correctly', async () => {
    await check('props_unionTypeRef', [
      {
        nodeText: 'MyTypeB',
        propertyName: 'props_unionTypeRef',
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
          {
            type: 'string-literal',
            value: 'c',
          },
        ],
      },
    ]);
  });

  test('property referenced on imported type from external package is presented and not parsed, but it values is presented', async () => {
    await check('props_dayjs', [
      {
        nodeText: 'Dayjs',
        propertyName: 'props_dayjs',
        type: 'imported-type',
        value: 'Dayjs',
        import: {
          moduleName: 'dayjs',
          type: 'Dayjs',
        },
      },
    ]);
  });

  test('property referenced on imported type of current package is presented and parsed correctly', async () => {
    await check('props_localImportedType', [
      {
        nodeText: 'LocalImportedType',
        propertyName: 'props_localImportedType',
        type: 'object',
        value: [
          {
            propertyName: 'apple',
            type: 'number',
          },
          {
            propertyName: 'juice',
            type: 'string',
          },
          {
            propertyName: 'orange',
            type: 'bigint',
            optional: true,
          },
        ],
      },
    ]);
  });

  test('Pick on property referenced on imported type of current package is presented and parsed correctly', async () => {
    await check('props_pickLocalImportedType', [
      {
        nodeText: "Pick<LocalImportedType, 'juice'>",
        propertyName: 'props_pickLocalImportedType',
        type: 'object',
        value: [
          {
            propertyName: 'juice',
            type: 'string',
          },
        ],
      },
    ]);
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
              nodeText: 'Partial<MyTypeC>',
              propertyName: 'props_partial',
              type: 'object',
              value: [
                {
                  optional: true,
                  propertyName: 'some',
                  type: 'number',
                },
                {
                  optional: true,
                  propertyName: 'another',
                  type: 'string',
                },
                {
                  optional: true,
                  propertyName: 'prop3',
                  type: 'bigint',
                },
                {
                  optional: true,
                  propertyName: 'prop4',
                  type: 'symbol',
                },
                {
                  optional: true,
                  propertyName: 'prop5',
                  type: 'null',
                },
                {
                  optional: true,
                  propertyName: 'prop6',
                  type: 'undefined',
                },
              ],
            },
            {
              nodeText: "Pick<MyTypeC, 'prop3' | 'prop5'>",
              propertyName: 'props_pick',
              type: 'object',
              value: [
                {
                  propertyName: 'prop3',
                  type: 'bigint',
                },
                {
                  optional: true,
                  propertyName: 'prop5',
                  type: 'null',
                },
              ],
            },
            {
              nodeText: "Omit<MyTypeC, 'some' | 'another' | 'prop3'>",
              propertyName: 'props_omit',
              type: 'object',
              value: [
                {
                  propertyName: 'prop4',
                  type: 'symbol',
                },
                {
                  optional: true,
                  propertyName: 'prop5',
                  type: 'null',
                },
                {
                  propertyName: 'prop6',
                  type: 'undefined',
                },
              ],
            },
            {
              propertyName: 'props_set',
              type: 'not-parsed',
              value: 'Set<string>',
            },
            {
              propertyName: 'props_map',
              type: 'not-parsed',
              value: 'Map<number, boolean>',
            },
            {
              propertyName: 'props_object',
              type: 'object',
              value: [
                {
                  propertyName: 'someData',
                  type: 'any',
                },
              ],
            },
            {
              nodeText: `{
    someDataInArray: any;
  }[]`,
              propertyName: 'props_objectArray',
              type: 'array',
              value: [
                {
                  type: 'object',
                  value: [
                    {
                      propertyName: 'someDataInArray',
                      type: 'any',
                    },
                  ],
                },
              ],
            },
            {
              nodeText: 'MyTypeA',
              propertyName: 'props_objectRef',
              type: 'object',
              value: [
                {
                  propertyName: 'someData',
                  type: 'any',
                },
              ],
            },
            {
              nodeText: 'MyTypeB',
              propertyName: 'props_unionTypeRef',
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
                {
                  type: 'string-literal',
                  value: 'c',
                },
              ],
            },
            {
              import: {
                moduleName: 'dayjs',
                type: 'Dayjs',
              },
              nodeText: 'Dayjs',
              propertyName: 'props_dayjs',
              type: 'imported-type',
              value: 'Dayjs',
            },
            {
              nodeText: 'LocalImportedType',
              propertyName: 'props_localImportedType',
              type: 'object',
              value: [
                {
                  propertyName: 'apple',
                  type: 'number',
                },
                {
                  propertyName: 'juice',
                  type: 'string',
                },
                {
                  optional: true,
                  propertyName: 'orange',
                  type: 'bigint',
                },
              ],
            },
            {
              nodeText: "Pick<LocalImportedType, 'juice'>",
              propertyName: 'props_pickLocalImportedType',
              type: 'object',
              value: [
                {
                  propertyName: 'juice',
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
