import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';

export function parseGenericPropertyAsConstraint(params: {
  debugName?: string;
  parsedProperty: ParsedProperty;
  tsType: ts.Type;
}) {
  const { parsedProperty, debugName, tsType } = params;

  const genericTypeConstraint = tsType.getConstraint() as ts.Type & {
    intrinsicName?: string;
  };
  if (genericTypeConstraint) {
    const genericDefault = tsType.getDefault() as ts.Type & {
      intrinsicName?: string;
    };

    if (genericDefault?.intrinsicName) {
      parsedProperty.type = 'generic-constraint';
      parsedProperty.value = genericDefault.intrinsicName;
      return true;
    }

    if (genericTypeConstraint.intrinsicName) {
      parsedProperty.type = 'generic-constraint';
      parsedProperty.value = genericTypeConstraint.intrinsicName;
      return true;
    }
  }

  return false;
}
