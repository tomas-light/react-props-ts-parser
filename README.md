# react-props-ts-parser

Work In Progress

Transform typescript Props definition:
```tsx
import { ReactNode } from 'react';

type Option<Label, Value> = {
  label: Label;
  value: Value;
}

type Props = {
  className?: string;
  open: boolean;
  onClick: () => void;
  size?: '16' | '24' | 36;
  count: number;
  options: Option<string, number>[];
  classes: Record<string, string>;
  children?: ReactNode;
};
```

to JSON:
```json
{
  "className": {
    "optional": true,
    "type": "string"
  },
  "open": {
    "type": "boolean"
  },
  "onClick": {
    "type": "function"
  },
  "size": {
    "optional": true,
    "type": "union-type",
    "values": [
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
  "count": {
    "type": "number"
  },
  "options": {
    "type": "array",
    "values": [
      {
        "type": "object",
        "value": {
          "type": "number"
        },
        "label": {
          "type": "string"
        }
      }
    ]
  },
  "classes": {
    "type": "not-parsed",
    "value": "Record<string, string>"
  },
  "children": {
    "optional": true,
    "type": "not-parsed",
    "value": "ReactNode"
  }
}
```

### How to use

```ts
import path from 'path';
import ts from 'typescript';
import { parsePropsInFile } from 'react-props-ts-parser';

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

const { source, parsed } = parsePropsInFile(
  path.join('src', 'TestComponent.tsx'),
  compilerOptions,
);
```
