import path from 'path';
import { ParsedObject, ParsedProperty } from '../../types';
import { Props } from './ReactTypes.props';
import { flatAndFilterPropertyByName } from './utils/findPropertyByName';
import { onceParsing } from './utils/onceParsing';

describe('[class] ReactTypes parser', () => {
  const filePath = path.join(__dirname, 'ReactTypes.props.ts');

  const parseSuite = onceParsing(filePath);

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
            type: 'AnchorHTMLAttributes',
            moduleName: 'react',
          },
          nodeText: 'AnchorHTMLAttributes<HTMLAnchorElement>',
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
            type: 'AnchorHTMLAttributes',
            moduleName: 'react',
          },
          nodeText: 'AnchorHTMLAttributes<HTMLAnchorElement>',
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
            type: 'InputHTMLAttributes',
            moduleName: 'react',
          },
          nodeText: 'InputHTMLAttributes<HTMLInputElement>',
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
            type: 'InputHTMLAttributes',
            moduleName: 'react',
          },
          nodeText: 'InputHTMLAttributes<HTMLInputElement>',
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
            type: 'CanvasHTMLAttributes',
            moduleName: 'react',
          },
          nodeText: 'CanvasHTMLAttributes<HTMLCanvasElement>',
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
            type: 'CanvasHTMLAttributes',
            moduleName: 'react',
          },
          nodeText: 'CanvasHTMLAttributes<HTMLCanvasElement>',
          type: 'object',
          // here are just a few properties to be sure type is parsed correctly
          value: [htmlAttributesParsedProperty],
        },
      ],
    ],
  };

  const _parse = onceParsing(filePath, {
    preventFromParsing: {
      react: ['CSSProperties', 'ReactElement', 'ReactNode'],
    },
  });

  async function check(
    propertyName: keyof Props | string,
    expectedValue: ParsedProperty[]
  ) {
    const result = await _parse();
    const targetProperty = flatAndFilterPropertyByName(result, propertyName);
    expect(targetProperty).toEqual(expectedValue);
  }

  test('style / css properties', async () => {
    await check('style', [
      {
        optional: true,
        propertyName: 'style',
        type: 'imported-type',
        value: 'CSSProperties',
        import: {
          type: 'CSSProperties',
          moduleName: 'react',
        },
        nodeText: 'CSSProperties',
      },
    ]);
  });

  describe.each(Object.entries(expected))(
    '%s',
    (propertyName, [, expectedParsedProperties]) => {
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

        const [typeSpecificParsedProperty] = expectedParsedProperties as [
          ParsedObject,
          ParsedObject,
        ];

        const selfProperties = result!.at(-1)!;

        if (selfProperties.type !== 'object') {
          expect(selfProperties.type).toBe('object');
          return;
        }

        typeSpecificParsedProperty.value!.forEach((expectedProperty) => {
          const actualSpecificProperty = findProperty(
            selfProperties.value,
            expectedProperty
          );
          expect(actualSpecificProperty).toEqual(expectedProperty);
        });
      });

      test('inherited html attributes are presented', async () => {
        const result = await parseSuite();

        const [, inheritedParsedProperties] = expectedParsedProperties as [
          ParsedObject,
          ParsedObject,
        ];

        const selfProperties = result!.at(-1)!;

        if (selfProperties.type !== 'object') {
          expect(selfProperties.type).toBe('object');
          return;
        }

        inheritedParsedProperties.value!.forEach((expectedProperty) => {
          const actualSpecificProperty = findProperty(
            selfProperties.value,
            expectedProperty
          );
          expect(actualSpecificProperty).toEqual(expectedProperty);
        });
      });

      async function parseAndFindProperty() {
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

        return anyActualProperty;
      }

      test('type is correct', async () => {
        const [anyExpectedProperty] = expectedParsedProperties as [
          ParsedObject,
          ParsedObject,
        ];

        const anyActualProperty = await parseAndFindProperty();

        expect(anyActualProperty?.type).toEqual(anyExpectedProperty.type);
      });

      test('import information is fulfilled', async () => {
        const [anyExpectedProperty] = expectedParsedProperties as [
          ParsedObject,
          ParsedObject,
        ];

        const anyActualProperty = await parseAndFindProperty();

        expect(anyActualProperty?.import).toEqual(anyExpectedProperty.import);
      });

      test('nodeText is correct', async () => {
        const [anyExpectedProperty] = expectedParsedProperties as [
          ParsedObject,
          ParsedObject,
        ];

        const anyActualProperty = await parseAndFindProperty();

        expect(anyActualProperty?.nodeText).toEqual(
          anyExpectedProperty.nodeText
        );
      });
    }
  );
});
