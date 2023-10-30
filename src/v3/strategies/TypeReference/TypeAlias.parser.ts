import ts, { SyntaxKind } from 'typescript';
import {
  InternalParseFunction,
  InternalParseOptions,
} from '../../ParseFunction';
import { ParserStrategy } from '../../ParserStrategy';
import { ParsedProperty } from '../../types';
import { findGenericParameterNodes } from './findGenericParameterNodes';
import { parseGenericParameterConstraints } from './parseGenericParameterConstraints';

export class TypeAliasParser extends ParserStrategy {
  parsePropertyValue: InternalParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText().trim();

    if (
      !ts.isTypeAliasDeclaration(tsNode) &&
      !ts.isInterfaceDeclaration(tsNode)
    ) {
      return;
    }

    if (options.skipTypeAliasAndInterfaces) {
      return [
        {
          type: 'prevented-from-parsing',
          value: debugName,
        },
      ];
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

    let identifier: ts.Identifier | undefined;
    const parsedProperties: ParsedProperty[] = [];

    tsNode.forEachChild((node) => {
      const nodeText = node.getFullText();

      if (node.kind === SyntaxKind.ExportKeyword) {
        return;
      }
      if (ts.isIdentifier(node)) {
        identifier = node;
        return;
      }
      // generic argument already parsed
      if (ts.isTypeParameterDeclaration(node)) {
        return;
      }

      const result = this.globalParse(node, optionsWithGenericParameters);
      if (result) {
        parsedProperties.push(...result);
      }
    });

    if (parsedProperties.length) {
      const nodeText = identifier?.getFullText().trim();
      parsedProperties.forEach((property) => {
        property.nodeText = nodeText;
      });
      return parsedProperties;
    }
  };
}
