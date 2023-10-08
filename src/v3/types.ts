import ts from 'typescript';

export interface ParsedPropertyDescriptor<Type extends string, Value = never> {
  propertyName?: string | number;
  optional?: boolean;

  type: Type;
  value?: Value;

  jsDoc?: {
    comment: string;
    fullText: string;
  };
}

export type ParsedGenericConstraints = ParsedProperty[] | 'generic';
export type ParsedGenericConstraintsMap = Map<
  ts.Symbol,
  ParsedGenericConstraints
>;

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
  | ParsedGenericPropertyConstraint
  | NotParsedType;

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
  extends ParsedPropertyDescriptor<'union-type', ParsedProperty[]> {}

export interface ParsedArray
  extends ParsedPropertyDescriptor<'array', ParsedProperty[]> {}

export interface ParsedObject
  extends ParsedPropertyDescriptor<'object', ParsedProperty[]> {}

export interface ParsedImportedReactType
  extends ParsedPropertyDescriptor<'imported-from-react', string> {}

export interface ParsedImportedType
  extends ParsedPropertyDescriptor<'imported-type', string> {}

export interface ParsedGenericPropertyConstraint
  extends ParsedPropertyDescriptor<
    'generic-constraint',
    ParsedProperty[] | string
  > {}

export interface NotParsedType
  extends ParsedPropertyDescriptor<'not-parsed', string> {}
