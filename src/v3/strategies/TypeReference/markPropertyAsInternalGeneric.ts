import { internalSymbol } from '../../symbols';
import { ParsedProperty } from '../../types';

export function markPropertyAsInternalGeneric(property: ParsedProperty) {
  if (!property[internalSymbol]) {
    property[internalSymbol] = {};
  }
  property[internalSymbol].isGenericArgument = true;
}
