import ts, { SyntaxKind } from 'typescript';
import { ParseFunction, ParseOptions } from '../../ParseFunction';
import { ParserStrategy } from '../../ParserStrategy';
import { ParsedProperty } from '../../types';
import { findGenericParameterNodes } from './findGenericParameterNodes';
import { parseGenericParameterConstraints } from './parseGenericParameterConstraints';

export class TypeAliasParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

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
          value: debugName.trim(),
        },
      ];
    }

    const genericParameterNodes = findGenericParameterNodes(tsNode);

    const parsedGenericConstraintsMap = parseGenericParameterConstraints(
      this.globalParse,
      genericParameterNodes,
      options
    );

    const optionsWithGenericParameters: ParseOptions = {
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

    tsNode.forEachChild((typeAliasNode) => {
      const nodeText = typeAliasNode.getFullText();

      if (typeAliasNode.kind === SyntaxKind.ExportKeyword) {
        return;
      }
      if (ts.isIdentifier(typeAliasNode)) {
        return;
      }
      // generic argument already parsed
      if (ts.isTypeParameterDeclaration(typeAliasNode)) {
        return;
      }

      const result = this.globalParse(
        typeAliasNode,
        optionsWithGenericParameters
      );
      if (result) {
        parsedProperties.push(...result);
      }
    });

    if (parsedProperties.length) {
      return parsedProperties;
    }
  };
}
