import ts from 'typescript';
import { GenericTypeParameters, ParsedProperty } from './types';

export type ParseFunction = (
  tsNode: ts.Node,
  options: {
    typeChecker: ts.TypeChecker;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
    passedParameters?: GenericTypeParameters;
  }
) => ParsedProperty[] | undefined;
