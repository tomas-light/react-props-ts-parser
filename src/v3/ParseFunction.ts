import ts from 'typescript';
import {
  ParsedPropertyOrGeneric,
  ParsedGenericConstraintsMap,
  ParsedProperty,
} from './types';

export type ParseOptions = {
  typeChecker: ts.TypeChecker;
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

export type ParseFunction = (
  tsNode: ts.Node,
  options: ParseOptions
) => ParsedProperty[] | undefined;
