import path from 'path';
import { findTsNodeInFile } from '../../../findTsNodeInFile';
import { parse } from '../../parse';
import { testCompilerOptions } from '../../testCompilerOptions';
import { ParsedProperty } from '../../types';
import { flatProperties } from './flatProperties';
import { Props } from './JsDoc.props';

describe('JsDoc parsing', () => {
  const filePath = path.join(__dirname, 'JsDoc.props.ts');

  const expected: {
    [propertyName in keyof Props]?: [string, ParsedProperty[]];
  } = {
    property_3: [
      'line comment before the property is ignored',
      [
        {
          propertyName: 'property_3',
          type: 'string',
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

      const result = parse(propsNode, { typeChecker });
      const properties = flatProperties(result);
      const targetProperty = properties.filter(
        (parsedProperty) => parsedProperty!.propertyName === propertyName
      );
      expect(targetProperty).toEqual(expectedValue);
    }
  );
});
