export function defined<Value>(
  value: Value | undefined | null
): value is Value {
  return Boolean(value);
}
