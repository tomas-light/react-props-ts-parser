import path from 'path';
import { findTsNodeInFile } from '../../../../findTsNodeInFile';
import { parse } from '../../../parse';
import { testCompilerOptions } from '../../../testCompilerOptions';
import { ParsedProperty } from '../../../types';

describe('[demo] Component 1', () => {
  const filePath = path.join(__dirname, 'Component1.props.ts');

  test('parsed correctly', async () => {
    const found = await findTsNodeInFile(
      filePath,
      'Props',
      testCompilerOptions
    );

    if (!found) {
      expect(found).not.toBeUndefined();
      return;
    }

    const { tsNode, typeChecker } = found;
    const result = parse(tsNode, {
      typeChecker,
      nodeCacheMap: new Map(),
      preventFromParsing: {
        react: ['CSSProperties', 'ReactElement', 'ReactNode'],
      },
    });
    expect(result).toEqual(expectedResult());
  });

  function expectedResult(): ParsedProperty[] {
    return [
      {
        nodeText: 'Props',
        type: 'object',
        value: [
          {
            optional: true,
            propertyName: 'backgroundColor',
            type: 'string',
          },
        ],
      },
      {
        nodeText: 'Props',
        type: 'object',
        value: [
          {
            propertyName: 'id',
            type: 'string',
          },
          {
            optional: true,
            propertyName: 'className',
            type: 'string',
          },
          {
            jsDoc: {
              comment: 'my property description',
              fullText:
                '/**\n   * my property description\n   * @example\n   * <TestComponent open={true} />\n   */',
            },
            propertyName: 'open',
            type: 'boolean',
          },
          {
            propertyName: 'onClick',
            type: 'function',
          },
          {
            optional: true,
            propertyName: 'size',
            type: 'union-type',
            value: [
              {
                type: 'string-literal',
                value: '16',
              },
              {
                type: 'string-literal',
                value: '24',
              },
              {
                type: 'number-literal',
                value: 36,
              },
            ],
          },
          {
            propertyName: 'count',
            type: 'number',
          },
          {
            nodeText: "Option<'name' | 'title', number>[]",
            propertyName: 'options',
            type: 'array',
            value: [
              {
                nodeText: 'Option',
                type: 'object',
                value: [
                  {
                    propertyName: 'label',
                    type: 'union-type',
                    value: [
                      {
                        type: 'string-literal',
                        value: 'name',
                      },
                      {
                        type: 'string-literal',
                        value: 'title',
                      },
                    ],
                  },
                  {
                    propertyName: 'value',
                    type: 'number',
                  },
                ],
              },
            ],
          },
          {
            import: {
              moduleName: 'react',
              type: 'ReactNode',
            },
            nodeText: 'ReactNode',
            propertyName: 'children',
            type: 'imported-type',
            value: 'ReactNode',
          },
          {
            nodeText: 'ReactElement<SomeOtherProps<Id>>[]',
            propertyName: 'someChildren',
            type: 'array',
            value: [
              {
                import: {
                  moduleName: 'react',
                  type: 'ReactElement',
                },
                nodeText: 'ReactElement<SomeOtherProps<Id>>',
                type: 'imported-type',
                value: 'ReactElement',
              },
            ],
          },
          {
            import: {
              moduleName: 'react',
              type: 'CSSProperties',
            },
            nodeText: 'CSSProperties',
            optional: true,
            propertyName: 'style',
            type: 'imported-type',
            value: 'CSSProperties',
          },
          {
            nodeText: 'Variant',
            propertyName: 'variant',
            type: 'union-type',
            value: [
              {
                type: 'string-literal',
                value: 'success',
              },
              {
                type: 'string-literal',
                value: 'info',
              },
              {
                type: 'string-literal',
                value: 'warning',
              },
              {
                type: 'string-literal',
                value: 'error',
              },
            ],
          },
          {
            import: {
              moduleName: 'dayjs',
              type: 'Dayjs',
            },
            nodeText: 'Dayjs',
            propertyName: 'date',
            type: 'imported-type',
            value: 'Dayjs',
          },
        ],
      },
    ];
  }
});
