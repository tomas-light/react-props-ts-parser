import path from 'path';
import { findTsNodeInFile } from '../../../findTsNodeInFile';
import { parse } from '../../parse';
import { testCompilerOptions } from '../../testCompilerOptions';
import { ParsedObject, ParsedProperty } from '../../types';
import { Props } from './ReactTypes.props';

describe('[class] ReactTypes parser', () => {
  const filePath = path.join(__dirname, 'ReactTypes.props.ts');

  const htmlAttributesParsedProperty: ParsedProperty = {
    propertyName: 'className',
    type: 'string',
    optional: true,
  };

  const expected: {
    [propertyName in keyof Props]?: [string, ParsedProperty[]];
  } = {
    anchor_attributes: [
      'AnchorHTMLAttributes<HTMLAnchorElement>',
      [
        {
          propertyName: 'anchor_attributes',
          import: {
            type: 'AnchorHTMLAttributes<HTMLAnchorElement>',
            moduleName: 'react',
          },
          type: 'object',
          // here are just a few properties to be sure type is parsed correctly
          value: [
            {
              propertyName: 'download',
              type: 'any',
              optional: true,
            },
            {
              propertyName: 'href',
              type: 'string',
              optional: true,
            },
          ],
        },
        {
          propertyName: 'anchor_attributes',
          import: {
            type: 'AnchorHTMLAttributes<HTMLAnchorElement>',
            moduleName: 'react',
          },
          type: 'object',
          // here are just a few properties to be sure type is parsed correctly
          value: [htmlAttributesParsedProperty],
        },
      ],
    ],
    input_attributes: [
      'InputHTMLAttributes<HTMLInputElement>',
      [
        {
          propertyName: 'input_attributes',
          import: {
            type: 'InputHTMLAttributes<HTMLInputElement>',
            moduleName: 'react',
          },
          type: 'object',
          // here are just a few properties to be sure type is parsed correctly
          value: [
            {
              propertyName: 'autoComplete',
              type: 'string',
              optional: true,
            },
            {
              propertyName: 'disabled',
              type: 'boolean',
              optional: true,
            },
          ],
        },
        {
          propertyName: 'input_attributes',
          import: {
            type: 'InputHTMLAttributes<HTMLInputElement>',
            moduleName: 'react',
          },
          type: 'object',
          // here are just a few properties to be sure type is parsed correctly
          value: [htmlAttributesParsedProperty],
        },
      ],
    ],
    canvas_attributes: [
      'CanvasHTMLAttributes<HTMLCanvasElement>',
      [
        {
          propertyName: 'canvas_attributes',
          import: {
            type: 'CanvasHTMLAttributes<HTMLCanvasElement>',
            moduleName: 'react',
          },
          type: 'object',
          // here are just a few properties to be sure type is parsed correctly
          value: [
            {
              propertyName: 'height',
              type: 'union-type',
              optional: true,
              value: [
                { type: 'number' },
                { type: 'string' },
                { type: 'undefined' },
              ],
            },
            {
              propertyName: 'width',
              type: 'union-type',
              optional: true,
              value: [
                { type: 'number' },
                { type: 'string' },
                { type: 'undefined' },
              ],
            },
          ],
        },
        {
          propertyName: 'canvas_attributes',
          import: {
            type: 'CanvasHTMLAttributes<HTMLCanvasElement>',
            moduleName: 'react',
          },
          type: 'object',
          // here are just a few properties to be sure type is parsed correctly
          value: [htmlAttributesParsedProperty],
        },
      ],
    ],
  };

  describe.each(Object.entries(expected))(
    '%s',
    (propertyName, [, expectedParsedProperties]) => {
      async function parseSuite() {
        const { tsNode: propsNode, typeChecker } = (await findTsNodeInFile(
          filePath,
          'Props',
          testCompilerOptions
        ))!;

        return parse(propsNode, { typeChecker });
      }

      function findProperty(
        parsedProperties: ParsedProperty[] | undefined,
        propertyToFind: ParsedProperty
      ) {
        const parsedObject = parsedProperties?.find(
          (actualProperty) =>
            actualProperty.type === 'object' &&
            actualProperty.value?.some(
              (property) =>
                property.propertyName === propertyToFind.propertyName
            )
        ) as unknown as ParsedObject | undefined;

        return parsedObject?.value?.find(
          (property) => property.propertyName === propertyToFind.propertyName
        );
      }

      test('type specific attributes are presented', async () => {
        const result = await parseSuite();

        const [, typeSpecificParsedProperty] = expectedParsedProperties as [
          ParsedObject,
          ParsedObject,
        ];

        typeSpecificParsedProperty.value!.forEach((expectedProperty) => {
          const actualSpecificProperty = findProperty(result, expectedProperty);
          expect(actualSpecificProperty).toEqual(expectedProperty);
        });
      });

      test('inherited html attributes are presented', async () => {
        const result = await parseSuite();

        const [, inheritedParsedProperties] = expectedParsedProperties as [
          ParsedObject,
          ParsedObject,
        ];

        inheritedParsedProperties.value!.forEach((expectedProperty) => {
          const actualSpecificProperty = findProperty(result, expectedProperty);
          expect(actualSpecificProperty).toEqual(expectedProperty);
        });
      });

      test('import information is fulfilled', async () => {
        const result = await parseSuite();

        const [anyExpectedProperty] = expectedParsedProperties as [
          ParsedObject,
          ParsedObject,
        ];

        const propertiesWithImport = result
          ?.filter(
            (actualProperty) =>
              actualProperty.type === 'object' &&
              actualProperty.value?.some((property) => property.import)
          )
          .flatMap((property) =>
            Array.isArray(property.value) ? property.value : property
          )
          .filter((property) => property.import);

        const anyActualProperty = propertiesWithImport?.find(
          (property) =>
            property.propertyName === anyExpectedProperty.propertyName
        );

        expect(anyActualProperty?.import).toEqual(anyExpectedProperty.import);
      });
    }
  );
});
