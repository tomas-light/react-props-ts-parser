import path from 'path';
import { parsePropsInFile } from './parsePropsInFile';
import { compilerOptions } from './tests/compilerOptions';

const { source, parsed } = parsePropsInFile(
  path.join('src', 'TestComponent.tsx'),
  compilerOptions,
);

if (source) {
  console.log(source, '\n');
}
if (parsed) {
  console.log(JSON.stringify(parsed, null, 2));
}
