import ts, { SyntaxKind } from 'typescript';
import {
  InternalParseFunction,
  InternalParseOptions,
} from '../../ParseFunction';
import { ParserStrategy } from '../../ParserStrategy';
import { ParsedObject, ParsedProperty } from '../../types';
import { findGenericParameterNodes } from './findGenericParameterNodes';
import { parseGenericParameterConstraints } from './parseGenericParameterConstraints';

export class InterfaceParser extends ParserStrategy {
  parsePropertyValue: InternalParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (!ts.isInterfaceDeclaration(tsNode)) {
      return;
    }

    const genericParameterNodes = findGenericParameterNodes(tsNode);

    const parsedGenericConstraintsMap = parseGenericParameterConstraints(
      this.globalParse,
      genericParameterNodes,
      options
    );

    const optionsWithGenericParameters: InternalParseOptions = {
      ...options,
      parsedGenericConstraintsMap: new Map(),
    };
    options.parsedGenericConstraintsMap?.forEach((value, key) => {
      optionsWithGenericParameters.parsedGenericConstraintsMap!.set(key, value);
    });
    parsedGenericConstraintsMap.forEach((value, key) => {
      optionsWithGenericParameters.parsedGenericConstraintsMap!.set(key, value);
    });

    const parsedProperties: ParsedProperty[] = [];

    const parsedObject: ParsedObject = {
      type: 'object',
      value: [],
    };

    tsNode.forEachChild((node) => {
      const nodeText = node.getFullText();

      if (node.kind === SyntaxKind.ExportKeyword) {
        return;
      }
      if (ts.isIdentifier(node)) {
        return;
      }
      // generic argument already parsed
      if (ts.isTypeParameterDeclaration(node)) {
        return;
      }

      // interface A extends B, C<string> {}
      if (ts.isHeritageClause(node)) {
        // B, C<string>
        node.forEachChild((extendedNode) => {
          const extendedNodeText = extendedNode.getFullText();

          const result = this.globalParse(
            extendedNode,
            optionsWithGenericParameters
          );
          if (result) {
            parsedProperties.push(...result);
          }
        });
        return;
      }

      const result = this.globalParse(node, optionsWithGenericParameters);
      if (result) {
        parsedObject.value!.push(...result);
      }
    });

    if (parsedObject.value!.length) {
      parsedProperties.push(parsedObject);
    }

    if (parsedProperties.length) {
      return parsedProperties;
    }
  };
}
