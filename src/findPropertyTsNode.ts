import ts from 'typescript';

export function findPropertyTsNode(
  propertyName: string,
  tsNode: ts.TypeAliasDeclaration | ts.InterfaceDeclaration,
): ts.Node | undefined {
  let propertyNode: ts.Node | undefined;

  if (ts.isInterfaceDeclaration(tsNode)) {
    propertyNode = findPropertySignatureInTypeLiteral(propertyName, tsNode);
  } else {
    ts.forEachChild(tsNode, (_tsNode) => {
      if (!propertyNode && ts.isTypeLiteralNode(_tsNode)) {
        propertyNode = findPropertySignatureInTypeLiteral(
          propertyName,
          _tsNode,
        );
      }
    });
  }

  return propertyNode;
}

function findPropertySignatureInTypeLiteral(
  propertyName: string,
  tsNode: ts.Node,
) {
  let propertyNode: ts.Node | undefined;

  ts.forEachChild(tsNode, (_tsNode) => {
    if (!propertyNode && ts.isPropertySignature(_tsNode)) {
      const nodeName = findPropertyNodeName(_tsNode);
      if (nodeName === propertyName) {
        propertyNode = _tsNode;
      }
    }
  });

  return propertyNode;
}

export function findPropertyNodeName(tsNode: ts.Node) {
  let nodeName: string | undefined;

  tsNode.forEachChild((_propertyNode) => {
    if (nodeName == null && ts.isIdentifier(_propertyNode)) {
      nodeName = _propertyNode.text;
    }
  });

  return nodeName;
}
