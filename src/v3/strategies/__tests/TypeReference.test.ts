import path from 'path';
import { findTsNodeInFile } from '../../../findTsNodeInFile';
import { parse } from '../../parse';
import { testCompilerOptions } from '../../testCompilerOptions';
import { ParsedProperty } from '../../types';
import { flatProperties } from './flatProperties';
import { Props } from './TypeReference.props';

describe('[class] TypeReference parser', () => {
  const filePath = path.join(__dirname, 'TypeReference.props.ts');

  const expected: {
    [propertyName in keyof Props]: [string, ParsedProperty];
  } = {
    props_partial: [
      'Partial property is presented in parsed result',
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
    ],
    props_pick: [
      'Pick property is presented and parsed correctly',
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
    ],
    props_omit: [
      'Omit property is presented and parsed correctly',
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
    ],
    props_set: [
      'Set property is presented and not parsed, but its values is presented',
      {
        propertyName: 'props_set',
        type: 'not-parsed',
        value: 'Set<string>',
      },
    ],
    props_map: [
      'Map property is presented and not parsed, but its values is presented',
      {
        propertyName: 'props_map',
        type: 'not-parsed',
        value: 'Map<number, boolean>',
      },
    ],
    props_object: [
      'Type Literal property is presented and parsed correctly',
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
    ],
    props_objectArray: [
      'Type Literals Array property is presented and parsed correctly',
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
    ],
    props_objectRef: [
      'property referenced on local defined type is presented and parsed correctly',
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
    ],
    props_unionTypeRef: [
      'property referenced on local defined union type is presented and parsed correctly',
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
    ],
    props_dayjs: [
      'property referenced on imported type from external package is presented and not parsed, but it values is presented',
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
    ],
    props_localImportedType: [
      'property referenced on imported type of current package is presented and parsed correctly',
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
    ],
    props_pickLocalImportedType: [
      'Pick on property referenced on imported type of current package is presented and parsed correctly',
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
        nodeCacheMap: new Map(),
      });
      const properties = flatProperties(result);
      const targetProperty = properties.find(
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
      nodeCacheMap: new Map(),
    });
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
