import ts from 'typescript';
import { InternalParseOptions } from '../ParseFunction';
import { JsDoc } from '../types';

export function parseJsDoc(
  tsNode: ts.Node,
  options: InternalParseOptions
): JsDoc | undefined {
  const nodeText = tsNode.getFullText();

  const { typeChecker } = options;

  const tsType = typeChecker.getTypeAtLocation(tsNode);

  // const symbol = tsType.aliasSymbol ?? tsType.symbol;
  // const symbol = typeChecker.getSymbolAtLocation(tsNode.name);
  // const contextualType = typeChecker.getContextualType(tsNode.parent);

  if (ts.isIdentifier(tsNode)) {
    const symbol = typeChecker.getSymbolAtLocation(tsNode);

    if (symbol) {
      const name = symbol.getName();
      const result1 = symbol?.getJsDocTags();
      const property = tsType.getProperty(name);
      const result2 = property?.getJsDocTags();
      const a = result1;
      const b = result2;
    }
  }

  const nodeWithJsDoc = tsNode as unknown as {
    jsDoc: ts.NodeArray<ts.Node>;
  };

  if (Array.isArray(nodeWithJsDoc.jsDoc) && nodeWithJsDoc.jsDoc.length > 0) {
    const [firstJsDocNode] = nodeWithJsDoc.jsDoc;
    return {
      comment: firstJsDocNode.comment,
      fullText: firstJsDocNode.getFullText(),
    };
  }

  return undefined;
}
