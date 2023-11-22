import { ParsedProperty } from '../../../types';

export function flatProperties(
  parsedProperties: ParsedProperty[] | undefined
): ParsedProperty[] {
  if (!parsedProperties) {
    return [];
  }

  return parsedProperties.flatMap((parsedProperty) => {
    if (!Array.isArray(parsedProperty.value)) {
      return parsedProperty;
    }
    if (parsedProperty.propertyName) {
      return parsedProperty;
    }

    return flatProperties(parsedProperty.value);
  });
}
