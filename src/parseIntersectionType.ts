import ts from 'typescript';
import {
  ObjectParsedProperties,
  ParsedIntersectionType,
  ParsedObject,
  ParsedProperty,
} from './ParsedProperty';
import { ITypeParser } from './ITypeParser';

export function parseIntersectionType(
  this: Pick<ITypeParser, 'parse' | 'parseType'>,
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
  },
): boolean {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;

  if (!ts.isIntersectionTypeNode(tsNode)) {
    return false;
  }

  const intersectionType = parsedProperty as ParsedIntersectionType;

  intersectionType.type = 'intersection-type';
  intersectionType.value = {
    inherited: [],
    self: {} as ParsedObject,
  };

  tsNode.forEachChild((childNode) => {
    if (ts.isTypeLiteralNode(childNode)) {
      const parsedResult = this.parse({
        tsNode: childNode,
      });

      intersectionType.value!.self = {
        type: 'object',
        value: parsedResult as ObjectParsedProperties,
      };
      return;
    }

    const intersectionProperty = this.parseType({
      tsNode: childNode,
    });

    intersectionType.value!.inherited.push(intersectionProperty);
  });

  return true;
}
