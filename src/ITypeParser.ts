import ts from 'typescript';
import {
  ObjectParsedProperties,
  ParsedIntersectionType,
  ParsedProperty,
} from './ParsedProperty';

export interface ITypeParser {
  typeChecker: ts.TypeChecker;
  sourceFile: ts.SourceFile;

  parse(params: {
    debugName?: string;
    tsNode: ts.Node;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  }): ParsedIntersectionType | ObjectParsedProperties;

  parsePropertySignatureNode(params: {
    debugName?: string;
    tsNode: ts.Node;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  }): {
    propertyName: string | undefined;
    parsedProperty: ParsedProperty | undefined;
  };

  parseType(params: {
    debugName?: string;
    tsNode: ts.Node;
    // it is required in cases when you process optional properties: QuestionToken will be adjusted to existed property descriptor instead of overriding it
    parsedProperty?: ParsedProperty;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  }): ParsedProperty;
}
