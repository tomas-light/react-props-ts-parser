import ts from 'typescript';
import { ParsedProperty } from './types';

export type ParseFunction = (
  tsNode: ts.Node,
  options: {
    typeChecker: ts.TypeChecker;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  },
) => ParsedProperty[] | undefined;
