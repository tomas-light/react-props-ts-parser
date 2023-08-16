import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';

export function parseQuestionToken(params: {
  debugName?: string;
  tsNode: ts.Node;
  parsedProperty: ParsedProperty;
}): boolean {
  const { tsNode, parsedProperty, debugName = tsNode.getFullText() } = params;

  if (ts.isQuestionToken(tsNode)) {
    parsedProperty.optional = true;
    return true;
  }

  return false;
}
