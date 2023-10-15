import path from 'path';
import { findTsNodeInFile } from '../../../findTsNodeInFile';
import { parse } from '../../parse';
import { testCompilerOptions } from '../../testCompilerOptions';
import { ParsedProperty } from '../../types';
import { flatProperties } from './flatProperties';

describe('[class] Literal parser', () => {
  const filePath = path.join(__dirname, 'Literal.props.ts');

  const expected = {
    props_string: [
      'string literal is presented in parsed result and parsed correctly',
      {
        propertyName: 'props_string',
        type: 'string-literal',
        value: 'string_1',
      } satisfies ParsedProperty,
    ] as const,
    props_number: [
      'number literal is presented in parsed result and parsed correctly',
      {
        propertyName: 'props_number',
        type: 'number-literal',
        value: 25,
      } satisfies ParsedProperty,
    ] as const,
    props_bigint: [
      'bigint literal is presented in parsed result and parsed correctly',
      {
        propertyName: 'props_bigint',
        type: 'bigint-literal',
        value: 100n,
      } satisfies ParsedProperty,
    ] as const,
    props_true: [
      'true literal is presented in parsed result and parsed correctly',
      {
        propertyName: 'props_true',
        type: 'boolean-literal',
        value: true,
      } satisfies ParsedProperty,
    ] as const,
    props_false: [
      'true literal is presented in parsed result and parsed correctly',
      {
        propertyName: 'props_false',
        type: 'boolean-literal',
        value: false,
      } satisfies ParsedProperty,
    ] as const,
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
              propertyName: 'props_string',
              type: 'string-literal',
              value: 'string_1',
            },
            {
              propertyName: 'props_number',
              type: 'number-literal',
              value: 25,
            },
            {
              propertyName: 'props_bigint',
              type: 'bigint-literal',
              value: 100n,
            },
            {
              propertyName: 'props_true',
              type: 'boolean-literal',
              value: true,
            },
            {
              propertyName: 'props_false',
              type: 'boolean-literal',
              value: false,
            },
          ],
        },
      ];
    }
  });
});
