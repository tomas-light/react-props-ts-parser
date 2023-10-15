# react-props-ts-parser

Work In Progress

Transform typescript Props definition:
```tsx
import { Dayjs } from 'dayjs';
import { CSSProperties, FC, ReactElement, ReactNode } from 'react';

type Option<Label extends string, Value> = {
  label: Label;
  value: Value;
};

type SomeProps = {
  backgroundColor?: string;
  variant: 'a' | 'b';
};

type SomeOtherProps<Id> = {
  id: Id;
  variant: 'a' | 'b';
};

type Variant = 'success' | 'info' | 'warning' | 'error';

type Props<Id extends string> =
  Pick<SomeProps, 'backgroundColor'> & {
  id: Id;
  className?: string;
  /**
   * my property description
   * @example
   * <TestComponent open={true} />
   */
  open: boolean;
  onClick: () => void;
  size?: '16' | '24' | 36;
  count: number;
  options: Option<'name' | 'title', number>[];
  // mapped types not supported yet
  classes: Record<string, string>;
  children: ReactNode;
  someChildren: ReactElement<SomeOtherProps<Id>>[];
  style?: CSSProperties;

  variant: Variant;
  date: Dayjs;
};
```

to JSON:
```json
[
  {
    "type": "object",
    "value": [
      {
        "optional": true,
        "propertyName": "backgroundColor",
        "type": "string"
      }
    ]
  },
  {
    "type": "object",
    "value": [
      {
        "propertyName": "id",
        "type": "string"
      },
      {
        "optional": true,
        "propertyName": "className",
        "type": "string"
      },
      {
        "jsDoc": {
          "comment": "my property description",
          "fullText": "/**\n   * my property description\n   * @example\n   * <TestComponent open={true} />\n   */"
        },
        "propertyName": "open",
        "type": "boolean"
      },
      {
        "propertyName": "onClick",
        "type": "function"
      },
      {
        "optional": true,
        "propertyName": "size",
        "type": "union-type",
        "value": [
          {
            "type": "string-literal",
            "value": "16"
          },
          {
            "type": "string-literal",
            "value": "24"
          },
          {
            "type": "number-literal",
            "value": 36
          }
        ]
      },
      {
        "propertyName": "count",
        "type": "number"
      },
      {
        "propertyName": "options",
        "type": "array",
        "value": [
          {
            "type": "object",
            "value": [
              {
                "propertyName": "label",
                "type": "union-type",
                "value": [
                  {
                    "type": "string-literal",
                    "value": "name"
                  },
                  {
                    "type": "string-literal",
                    "value": "title"
                  }
                ]
              },
              {
                "propertyName": "value",
                "type": "number"
              }
            ]
          }
        ]
      },
      {
        "import": {
          "moduleName": "react",
          "type": "ReactNode"
        },
        "propertyName": "children",
        "type": "imported-type",
        "value": "ReactNode"
      },
      {
        "propertyName": "someChildren",
        "type": "array",
        "value": [
          {
            "import": {
              "moduleName": "react",
              "type": "ReactElement"
            },
            "type": "imported-type",
            "value": "ReactElement"
          }
        ]
      },
      {
        "import": {
          "moduleName": "react",
          "type": "CSSProperties"
        },
        "optional": true,
        "propertyName": "style",
        "type": "imported-type",
        "value": "CSSProperties"
      },
      {
        "propertyName": "variant",
        "type": "union-type",
        "value": [
          {
            "type": "string-literal",
            "value": "success"
          },
          {
            "type": "string-literal",
            "value": "info"
          },
          {
            "type": "string-literal",
            "value": "warning"
          },
          {
            "type": "string-literal",
            "value": "error"
          }
        ]
      },
      {
        "import": {
          "moduleName": "dayjs",
          "type": "Dayjs"
        },
        "propertyName": "date",
        "type": "imported-type",
        "value": "Dayjs"
      }
    ]
  }
]
```

### How to use

```ts
import path from 'path';
import ts from 'typescript';
import { findTsNodeInFile, parse } from 'react-props-ts-parser';

// you can try to use tsconf.json compilerOptions, but there are type incompatibilities
const compilerOptions: ts.CompilerOptions = {
  allowSyntheticDefaultImports: true,
  composite: true,
  declaration: true,
  declarationMap: true,
  esModuleInterop: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  forceConsistentCasingInFileNames: true,
  isolatedModules: true,
  jsx: ts.JsxEmit.ReactJSX,
  lib: ['dom', 'dom.iterable', 'esnext'],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noImplicitAny: true,
  resolveJsonModule: true,
  skipLibCheck: true,
  strictNullChecks: true,
  sourceMap: true,
  strict: true,
  target: ts.ScriptTarget.ESNext,
};

const found = await findTsNodeInFile(
  path.join('src', 'TestComponent.tsx'),
  'Props',
  testCompilerOptions
);

if (found) {
  const { tsNode, typeChecker } = found;
  const parsedProperties = parse(tsNode, { typeChecker });
}
```
