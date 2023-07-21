export interface ParsedPropertyDescriptor<
  Type extends string,
  Value = never,
  Values = never,
> {
  type: Type;
  jsDoc?: {
    comment: string;
    fullText: string;
  };
  optional?: boolean;
  value?: Value;
  values?: Values;
}

export interface ParsedString extends ParsedPropertyDescriptor<'string'> {}

export interface ParsedNumber extends ParsedPropertyDescriptor<'number'> {}

export interface ParsedBoolean extends ParsedPropertyDescriptor<'boolean'> {}

export interface ParsedUndefined
  extends ParsedPropertyDescriptor<'undefined'> {}

export interface ParsedSymbol extends ParsedPropertyDescriptor<'symbol'> {}

export interface ParsedBigint extends ParsedPropertyDescriptor<'bigint'> {}

export interface ParsedNull extends ParsedPropertyDescriptor<'null'> {}

export interface ParsedFunction extends ParsedPropertyDescriptor<'function'> {}
export interface ParsedAny extends ParsedPropertyDescriptor<'any'> {}
export interface ParsedUnknown extends ParsedPropertyDescriptor<'unknown'> {}

export interface ParsedStringLiteral
  extends ParsedPropertyDescriptor<'string-literal', string> {}

export interface ParsedNumberLiteral
  extends ParsedPropertyDescriptor<'number-literal', number> {}

export interface ParsedBigIntLiteral
  extends ParsedPropertyDescriptor<'bigint-literal', bigint> {}

export interface ParsedBooleanLiteral
  extends ParsedPropertyDescriptor<'boolean-literal', boolean> {}

export interface ParsedUnionType
  extends ParsedPropertyDescriptor<'union-type', never, ParsedProperty[]> {}

export interface ParsedArray
  extends ParsedPropertyDescriptor<'array', never, ParsedProperty[]> {}

export interface ParsedObject
  extends ParsedPropertyDescriptor<
    'object',
    { [propertyName: string]: ParsedProperty }
  > {}

export interface ParsedImportedReactType
  extends ParsedPropertyDescriptor<'imported-from-react', string> {}

export interface ParsedImportedType
  extends ParsedPropertyDescriptor<'imported-type', string> {}

export interface ParsedGenericConstraint
  extends ParsedPropertyDescriptor<'generic-constraint', string> {}

export interface NotParsedType
  extends ParsedPropertyDescriptor<'not-parsed', string> {}

export type ParsedProperty =
  | ParsedString
  | ParsedNumber
  | ParsedBoolean
  | ParsedUndefined
  | ParsedSymbol
  | ParsedBigint
  | ParsedNull
  | ParsedFunction
  | ParsedAny
  | ParsedUnknown
  | ParsedStringLiteral
  | ParsedNumberLiteral
  | ParsedBigIntLiteral
  | ParsedBooleanLiteral
  | ParsedUnionType
  | ParsedArray
  | ParsedObject
  | ParsedImportedReactType
  | ParsedImportedType
  | ParsedGenericConstraint
  | NotParsedType;