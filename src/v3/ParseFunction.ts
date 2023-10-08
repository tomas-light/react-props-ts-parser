import ts from 'typescript';
import {
  ParsedGenericConstraints,
  ParsedGenericConstraintsMap,
  ParsedProperty,
} from './types';

export type ParseOptions = {
  typeChecker: ts.TypeChecker;
  typeArguments?: ts.NodeArray<ts.TypeNode>;
  parsedGenericConstraints?: ParsedGenericConstraintsMap;
  passedGenericConstraintsAsParameterToNestedGeneric?: ParsedGenericConstraints[];
};

export type ParseFunction = (
  tsNode: ts.Node,
  options: ParseOptions
) => ParsedProperty[] | undefined;
