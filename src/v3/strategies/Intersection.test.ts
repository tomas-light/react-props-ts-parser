import path from 'path';
import { findTsNodeInFile } from '../../findTsNodeInFile';
import { parse } from '../parse';
import { testCompilerOptions } from '../testCompilerOptions';
import { ParsedProperty } from '../types';
import { Props } from './Intersection.props';

describe('[class] Intersection parser', () => {
  const filePath = path.join(__dirname, 'Intersection.props.ts');

  const expected: {
    [propertyName in keyof Props]: [string, ParsedProperty];
  } = {
    external_string1: [
      'first property of first inherited object is presented in parsed result and it is parsed correctly',
      {
        optional: true,
        propertyName: 'external_string1',
        type: 'string',
      },
    ],
    external_string2: [
      'second property of first inherited object is presented in parsed result and it is parsed correctly',
      {
        propertyName: 'external_string2',
        type: 'string',
      },
    ],
    external_number1: [
      'first self property of inherited interception type is presented in parsed result and it is parsed correctly',
      {
        propertyName: 'external_number1',
        type: 'number',
      },
    ],
    external_number2: [
      'second self property of inherited interception type is presented in parsed result and it is parsed correctly',
      {
        propertyName: 'external_number2',
        type: 'number',
      },
    ],
    external_boolean1: [
      'first inherited property of inherited interception type is presented in parsed result and it is parsed correctly',
      {
        propertyName: 'external_boolean1',
        type: 'boolean',
      },
    ],
    external_boolean2: [
      'second inherited property of inherited interception type is presented in parsed result and it is parsed correctly',
      {
        propertyName: 'external_boolean2',
        type: 'boolean',
      },
    ],
    props_string1: [
      'first self property is presented in parsed result and it is parsed correctly',
      {
        propertyName: 'props_string1',
        type: 'string',
      },
    ],
    props_string2: [
      'second self property is presented in parsed result and it is parsed correctly',
      {
        propertyName: 'props_string2',
        type: 'string',
      },
    ],
  };

  test.each(Object.entries(expected))(
    '%s',
    async ([propertyName, [, expectedValue]]) => {
      const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
        filePath,
        'Props',
        testCompilerOptions,
      ))!;

      const result = parse(propsNode, { typeChecker });
      expect(result?.[propertyName as keyof typeof result]).toEqual(
        expectedValue,
      );
    },
  );

  test('full parsed type is parsed correctly', async () => {
    const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
      filePath,
      'Props',
      testCompilerOptions,
    ))!;

    const result = parse(propsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'object',
        value: [expected.external_string1![1], expected.external_string2[1]],
      },
      {
        type: 'object',
        value: [expected.external_boolean1[1], expected.external_boolean2[1]],
      },
      {
        type: 'object',
        value: [expected.external_number1[1], expected.external_number2[1]],
      },
      {
        type: 'object',
        value: [expected.props_string1[1], expected.props_string2[1]],
      },
    ] satisfies ParsedProperty[]);
  });
});
