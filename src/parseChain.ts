import ts from 'typescript';
import { ParsedProperty } from './ParsedProperty';
import { parsePrimitiveType } from './parsePrimitiveType';
import { parseLiteralType } from './parseLiteralType';
import { parseUnionType } from './parseUnionType';
import { parseArrayType } from './parseArrayType';
import { parseQuestionToken } from './parseQuestionToken';
import { parseTypeAlias } from './parseTypeAlias';
import { parseInterfaceDeclaration } from './parseInterfaceDeclaration';
import { parseImportedType } from './parseImportedType';
import { parseLocalDefinedType } from './parseLocalDefinedType';
import { parseMappedType } from './parseMappedType';
import { parseGenericPropertyWithArgumentInReferencedType } from './parseGenericPropertyWithArgumentInReferencedType';
import { parseGenericProperty } from './parseGenericProperty';
import { parseIntersectionType } from './parseIntersectionType';
import { ITypeParser } from './ITypeParser';

export function parseChain(
  this: ITypeParser,
  params: {
    debugName?: string;
    tsNode: ts.Node;
    parsedProperty: ParsedProperty;
    typeArguments?: ts.NodeArray<ts.TypeNode>;
  },
) {
  let handled = false;

  const parser = {
    arrayType: () => {
      if (!handled) {
        handled = parseArrayType.call(this, params);
      }
      return parser;
    },
    fallback: (callback: () => void) => {
      if (!handled) {
        handled = true;
        callback();
      }
      return parser;
    },
    genericProperty: () => {
      if (!handled) {
        handled = parseGenericProperty.call(this, params);
      }
      return parser;
    },
    genericPropertyWithArgumentInReferencedType: () => {
      if (!handled) {
        handled = parseGenericPropertyWithArgumentInReferencedType.call(
          this,
          params,
        );
      }
      return parser;
    },
    importedType: () => {
      if (!handled) {
        handled = parseImportedType.call(this, params);
      }
      return parser;
    },
    interfaceDeclaration: () => {
      if (!handled) {
        handled = parseInterfaceDeclaration.call(this, params);
      }
      return parser;
    },
    intersectionType: () => {
      if (!handled) {
        handled = parseIntersectionType.call(this, params);
      }
      return parser;
    },
    literalType: () => {
      if (!handled) {
        handled = parseLiteralType.call(this, params);
      }
      return parser;
    },
    localDefinedType: () => {
      if (!handled) {
        handled = parseLocalDefinedType.call(this, params);
      }
      return parser;
    },
    mappedType: () => {
      if (!handled) {
        handled = parseMappedType.call(this, params);
      }
      return parser;
    },

    primitiveType: () => {
      if (!handled) {
        handled = parsePrimitiveType(params);
      }
      return parser;
    },
    questionToken: () => {
      if (!handled) {
        handled = parseQuestionToken(params);
      }
      return parser;
    },
    typeAlias: () => {
      if (!handled) {
        handled = parseTypeAlias.call(this, params);
      }
      return parser;
    },
    unionType: () => {
      if (!handled) {
        handled = parseUnionType.call(this, params);
      }
      return parser;
    },
  };

  return parser;
}
