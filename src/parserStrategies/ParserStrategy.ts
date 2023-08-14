import ts from 'typescript';
import { ParsedProperty } from '../ParsedProperty';

export interface ParserStrategy {
  parse(
    tsNode: ts.Node,
    options?: {
      typeChecker: ts.TypeChecker;
      typeArguments?: ts.NodeArray<ts.TypeNode>;
    },
  ): ParsedProperty[] | undefined;
}
