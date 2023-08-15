import ts from 'typescript';
import { ParsedProperty } from '../ParsedProperty';

export abstract class ParserStrategy {
  constructor(protected readonly globalParse: ParserStrategy['parse']) {}

  abstract parse(
    tsNode: ts.Node,
    options: {
      typeChecker: ts.TypeChecker;
      typeArguments?: ts.NodeArray<ts.TypeNode>;
    },
  ): ParsedProperty[] | undefined;
}
