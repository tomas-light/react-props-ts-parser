# react-props-ts-parser

Work In Progress

Transform typescript Props definition:
```tsx
import { Dayjs } from 'dayjs';
import { CSSProperties, FC, ReactNode } from 'react';

type Option<Label extends string, Value> = {
  label: Label;
  value: Value;
};

type SomeProps = {
  backgroundColor?: string;
  variant: 'a' | 'b';
};

type Props<Id extends string> =
  // mapped types not supported yet
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
  options: Option<string, number>[];
  classes: Record<string, string>; // mapped types not supported yet
  children: ReactNode;
  style?: CSSProperties;
  date: Dayjs;
};
```

to JSON:
```json
{
  "id": {
    "value": "Id",
    "type": "imported-type"
  },
  "className": {
    "optional": true,
    "type": "string"
  },
  "open": {
    "type": "boolean",
    "jsDoc": {
      "comment": "my property description",
      "fullText": "/**\n   * my property description\n   * @example\n   * <TestComponent open={true} />\n   */"
    }
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
        "value": "Option<string, number>",
        "type": "imported-type"
      }
    ]
  },
  "classes": {
    "value": "Record<string, string>",
    "type": "imported-type"
  },
  "children": {
    "value": "ReactNode",
    "type": "imported-from-react"
  },
  "style": {
    "optional": true,
    "value": "CSSProperties",
    "type": "imported-from-react"
  },
  "date": {
    "value": "Dayjs",
    "type": "imported-type"
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
