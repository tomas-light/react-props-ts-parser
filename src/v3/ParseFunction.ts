import ts from 'typescript';
import {
  NodeCacheMap,
  ParsedGenericConstraintsMap,
  ParsedProperty,
  ParsedPropertyOrGeneric,
} from './types';

export type InternalParseOptions = {
  typeChecker: ts.TypeChecker;
  nodeCacheMap: NodeCacheMap;

  typeArguments?: ts.NodeArray<ts.TypeNode>;
  /**
   * relation between parsed constraint and its parameter:
   * @example
   * type Props<Id extends number> { ... }
   *
   * in the map we will have [<Id identifier symbol>, [ { type: "number" } ]]
   * */
  parsedGenericConstraintsMap?: ParsedGenericConstraintsMap;
  /**
   * when you have generic props that pass its generic further, like:
   * @example
   * type Props<Id extends number> {
   *   option: Option<Id>;
   * }
   * */
  passedGenericConstraintsAsParameterToNestedGeneric?: ParsedPropertyOrGeneric[];

  /**
   * omit parsing of TypeAlias and Interface, suitable when you parse imported type (like HtmlAttributes) and want to prevent deep diving (and parsing break)
   * */
  skipTypeAliasAndInterfaces?: boolean;
};

export type ParseOptions = Partial<
  Omit<InternalParseOptions, 'nodeIdToArgumentKeyMap'>
> & {
  typeChecker: ts.TypeChecker;
};

export type InternalParseFunction = (
  tsNode: ts.Node,
  options: InternalParseOptions
) => ParsedProperty[] | undefined;

export type ParseFunction = (
  tsNode: ts.Node,
  options: ParseOptions
) => ParsedProperty[] | undefined;
