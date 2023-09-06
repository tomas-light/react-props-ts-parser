import ts from 'typescript';
import { ParseFunction } from '../../ParseFunction';
import { ParserStrategy } from '../../ParserStrategy';

export class GenericTypeReferenceParser extends ParserStrategy {
  parsePropertyValue: ParseFunction = (tsNode, options) => {
    const debugName = tsNode.getFullText();

    if (!ts.isTypeReferenceNode(tsNode)) {
      return;
    }

    const { typeChecker } = options;

    const { tsType, constraint: genericTypeConstraint } =
      findNodeGenericConstraint(tsNode, typeChecker);

    const isGenericConstraint = genericTypeConstraint != null;
    if (isGenericConstraint) {
      const genericTypeDefault = tsType.getDefault() as ts.Type & {
        intrinsicName?: string;
      };

      // todo: wrong code
      if (genericTypeDefault?.intrinsicName) {
        return [
          {
            type: 'generic-constraint',
            value: [
              {
                type: 'string-literal',
                value: genericTypeDefault.intrinsicName,
              },
            ],
          },
        ];
      }

      if (genericTypeConstraint.intrinsicName) {
        return [
          {
            type: 'generic-constraint',
            value: [
              {
                type: 'string-literal',
                value: genericTypeConstraint.intrinsicName,
              },
            ],
          },
        ];
      }
    }
  };
}

export function findNodeGenericConstraint(
  tsNode: ts.TypeReferenceNode,
  typeChecker: ts.TypeChecker
) {
  const tsType = typeChecker.getTypeAtLocation(tsNode);
  const constraint = tsType.getConstraint() as ts.Type & {
    intrinsicName?: string;
  };

  return {
    tsType,
    constraint,
  };
}
