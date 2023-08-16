import path from 'path';
import { findTsNodeInFile } from '../../findTsNodeInFile';
import { parse } from '../parse';
import { testCompilerOptions } from '../testCompilerOptions';
import { ParsedProperty } from '../types';

describe('[class] Intersection parser', () => {
  const filePath = path.join(__dirname, 'Intersection.props.ts');

  // test.each([
  //   ['self property', 'props_string', 'string'],
  //   ['inherited from one external type', 'external_string', 'string'],
  //   ['inherited from first of two external types', 'external_number', 'number'],
  //   [
  //     'inherited from second of two external types',
  //     'external_boolean',
  //     'boolean',
  //   ],
  // ])(
  //   '%s property is parsed correctly',
  //   async (_, propertyName, expectedType) => {
  //     const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
  //       filePath,
  //       'Props',
  //       compilerOptions,
  //     ))!;
  //
  //     const result = parse(propsNode, { typeChecker });
  //     expect(result).toEqual([
  //       {
  //         type: 'object',
  //         value: [
  //           {
  //             type: expectedType,
  //           },
  //         ],
  //       },
  //     ]);
  //   },
  // );
  test('%s property is parsed correctly', async () => {
    const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
      filePath,
      'Props',
      testCompilerOptions,
    ))!;

    const result = parse(propsNode, { typeChecker });
    expect(result).toEqual([
      {
        type: 'object',
        value: [
          {
            optional: true,
            propertyName: 'external_string',
            type: 'string',
          },
        ],
      },
      {
        type: 'object',
        value: [
          {
            optional: false,
            propertyName: 'external_boolean',
            type: 'boolean',
          },
        ],
      },
      {
        type: 'object',
        value: [
          {
            optional: false,
            propertyName: 'external_number',
            type: 'number',
          },
        ],
      },
      {
        type: 'object',
        value: [
          {
            optional: false,
            propertyName: 'props_string',
            type: 'string',
          },
        ],
      },
    ] satisfies ParsedProperty[]);
    // expect(result).toEqual([
    //   {
    //     type: 'object',
    //     value: {
    //       external_string: [
    //         {
    //           type: 'string',
    //         },
    //       ],
    //       external_boolean: [
    //         {
    //           type: 'boolean',
    //         },
    //       ],
    //       external_number: [
    //         {
    //           type: 'number',
    //         },
    //       ],
    //       props_string: [
    //         {
    //           type: 'string',
    //         },
    //       ],
    //     },
    //   },
    // ] satisfies ParsedProperty[]);
  });
});
