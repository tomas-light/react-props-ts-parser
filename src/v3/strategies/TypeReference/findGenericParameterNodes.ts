import ts, { SyntaxKind } from 'typescript';

export function findGenericParameterNodes(tsNode: ts.Node) {
  let hasGenericParameters = false;
  let genericParameterNodes: ts.TypeParameterDeclaration[] | undefined;

  for (const node of tsNode.getChildren()) {
    const nodeText = node.getFullText();

    if (node.kind === SyntaxKind.LessThanToken) {
      hasGenericParameters = true;
      continue;
    }

    if (hasGenericParameters && node.kind === SyntaxKind.SyntaxList) {
      genericParameterNodes = findParameterNodes(node);
      // for interfaces further syntax lists have different meaning
      break;
    }
  }

  return genericParameterNodes;
}

function findParameterNodes(syntaxListNode: ts.Node) {
  const parameterNodes: ts.TypeParameterDeclaration[] = [];

  for (const node of syntaxListNode.getChildren()) {
    const nodeText = node.getFullText();

    if (ts.isTypeParameterDeclaration(node)) {
      parameterNodes.push(node);
    }
  }

  return parameterNodes;
}
