import ts from 'typescript';

export const compilerOptions: ts.CompilerOptions = {
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
