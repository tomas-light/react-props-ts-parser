import ts from 'typescript';
import { ParseFunction, ParseOptions } from '../../ParseFunction';
import { ParsedGenericConstraintsMap } from '../../types';
import { findGenericConstraint } from './findGenericConstraint';

export function parseGenericParameterConstraints(
  globalParse: ParseFunction,
  genericParameterNodes: ts.TypeParameterDeclaration[] | undefined,
  options: ParseOptions
) {
  const parsedGenericConstraintsMap: ParsedGenericConstraintsMap = new Map();

  genericParameterNodes?.forEach((genericParameterNode, parameterIndex) => {
    const nodeText = genericParameterNode.getFullText();

    const { identifierSymbol, constraint } = findGenericConstraint(
      genericParameterNode,
      options
    );

    /** Props<Id extends number> {...}
     * to be able to connect "number" constraint to "Id", we use identifier symbol of "Id"
     * if such symbol is undefined - we cannot proceed with this relation
     */
    if (!identifierSymbol) {
      return;
    }

    const passedParsedProperty =
      options.passedGenericConstraintsAsParameterToNestedGeneric?.[
        parameterIndex
      ];

    if (passedParsedProperty) {
      parsedGenericConstraintsMap.set(identifierSymbol, passedParsedProperty);
      return;
    }

    if (constraint) {
      const parsedProperties = globalParse(constraint, options);
      if (parsedProperties) {
        parsedGenericConstraintsMap.set(identifierSymbol, parsedProperties);
        return;
      }
    }
    parsedGenericConstraintsMap.set(identifierSymbol, 'generic');
  });

  return parsedGenericConstraintsMap;
}