import { ParsedObject, ParsedProperty } from '../../../types';
import { flatProperties } from './flatProperties';

export function findPropertyByName<T>(
  properties: ParsedProperty[] | undefined,
  propertyName: keyof T
) {
  const [objectProperty] = (properties ?? []) as [ParsedObject];

  return objectProperty?.value?.find(
    (property) => property.propertyName === propertyName
  );
}

export function flatAndFilterPropertyByName<T>(
  parsedProperties: ParsedProperty[] | undefined,
  propertyName: keyof T
) {
  const properties = flatProperties(parsedProperties);
  return properties.filter(
    (parsedProperty) => parsedProperty!.propertyName === propertyName
  );
}
