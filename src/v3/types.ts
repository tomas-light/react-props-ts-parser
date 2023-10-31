import ts from 'typescript';
import { internalSymbol } from './symbols';

export interface JsDoc {
  comment?: string;
  fullText?: string;
}

export interface ParsedPropertyDescriptor<Type extends string, Value = never> {
  propertyName?: string | number;
  optional?: boolean;

  type: Type;
  value?: Value;
  cachedValueRef?: ts.Symbol;
  /** "Props" / "HTMLAttributes<HTMLDivElement>" */
  nodeText?: string;

  [internalSymbol]?: {
    isGenericArgument?: boolean;
  };

  jsDoc?: JsDoc;

  /** for types imported from React, DayJs and so on */
  import?: {
    /** something like "HTMLAttributes" */
    type?: string;
    /** something like "react", "dayjs" */
    moduleName?: string;
  };
}

export type NodeId = ts.Symbol;
export type NodeIdOrText = ts.Symbol | string;

/**
 * @example
 * MyType => [
 *   <type identifier symbol>, [{
 *     cached: [{ type: 'string' }]
 *   }]
 * ]
 *
 * Some<'qwe'> => [
 *   <type identifier symbol>, [{
 *     argumentsSet: [<symbol identifier of 'qwe'>],
 *     cached: [{ type: 'number' }]
 *   }]
 * ]
 *
 * HTMLAttributes<HTMLDivElement> => [
 *   <type identifier symbol>, [{
 *     argumentsSet: [<symbol identifier of 'HTMLDivElement'>],
 *     cached: [{ type: 'object' }]
 *   }]
 * ]
 * */
export type NodeCacheMap = Map<
  /** symbol of identifier
   * @example
   * for HTMLAttributes<HTMLDivElement>, here will be identifier "HTMLAttributes"
   * for Pick<MyType, 'qwe' | 'abc'>, here will be identifier "Pick"
   * */
  NodeId | undefined,
  /** generics may have several parsed results
   * @example
   * HTMLAttributes<HTMLDivElement>
   * HTMLAttributes<HTMLButtonElement>
   * Pick<MyType, 'prop1'>
   * Pick<MyType, 'prop2'>
   * Pick<AnotherType, 'prop2' | 'prop3'>
   * */
  Cached[]
>;

export type Cached = {
  /**
   * @example
   * Pick<MyType, 'qwe' | 'abc'> => [
   *   <"MyType" identifier symbol>,
   *   <"'qwe' | 'abc'" identifier symbol>,
   * ]
   *
   * Some<'qwe'> => [
   *   <"qwe" identifier symbol>,
   * ]
   *
   * HTMLAttributes<HTMLDivElement> => [
   *   <"HTMLDivElement" identifier symbol>,
   * ]
   * */
  argumentsSet?: Set<NodeIdOrText>;
  cached: ParsedProperty[];
};

export type ParsedPropertyOrGeneric = ParsedProperty[] | 'generic';
export type ParsedGenericConstraintsMap = Map<
  ts.Symbol, // symbol of identifier to generic parameter
  ParsedPropertyOrGeneric // if generic parameter has constraint, here is parsed property of this constraint
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
  | NotParsedType
  | PreventedFromParsingType;

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

export interface PreventedFromParsingType
  extends ParsedPropertyDescriptor<'prevented-from-parsing', string> {}
