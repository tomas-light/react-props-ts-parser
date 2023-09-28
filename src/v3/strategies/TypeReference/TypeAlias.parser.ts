import ts, { SyntaxKind } from 'typescript';
import { ParseFunction } from '../../ParseFunction';
import { ParserStrategy } from '../../ParserStrategy';
import { ParsedProperty } from '../../types';

export class TypeAliasParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (!ts.isTypeAliasDeclaration(tsNode)) {
      return;
    }

    const parsedProperties: ParsedProperty[] = [];

    tsNode.forEachChild((typeAliasNode) => {
      // generic argument
      if (ts.isTypeParameterDeclaration(typeAliasNode)) {
        this.addTypeParameter(typeAliasNode, options);
        return;
      }

      const result = this.globalParse(typeAliasNode, options);
      if (result) {
        parsedProperties.push(...result);
      }
    });

    if (parsedProperties.length) {
      return parsedProperties;
    }
  };

  // todo: use somewhere?
  private addTypeParameter(
    typeAliasNode: ts.TypeParameterDeclaration,
    options: Parameters<ParseFunction>[1]
  ) {
    if (!this.typeParameters) {
      this.typeParameters = new Map();
    }

    let identifier: ts.Identifier | undefined;
    let hasExtendsKeyword = false;
    let constraint: ts.Node | undefined;

    for (const child of typeAliasNode.getChildren()) {
      if (ts.isIdentifier(child)) {
        identifier = child;
      } else if (child.kind === SyntaxKind.ExtendsKeyword) {
        hasExtendsKeyword = true;
      } else if (hasExtendsKeyword) {
        constraint = child;
      }
    }

    if (!identifier) {
      return;
    }

    this.typeParameters.set(identifier, 'generic');

    if (constraint) {
      const parsedProperties = this.globalParse(constraint, options);
      if (parsedProperties) {
        this.typeParameters.set(identifier, parsedProperties);
      }
    }
  }
}
