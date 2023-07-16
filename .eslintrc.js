module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 'latest', // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`

        // use an array of glob patterns
        project: ['application/*/tsconfig.json'],
      },
    },
    'import/internal-regex': '^@food-captain/', // consider such import modules as "internal" to correct sorting
  },
  extends: [
    'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:import/recommended', // sort "import" statements
    'prettier', // Disables ESLint rules that would conflict with prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  plugins: ['import'],
  rules: {
    'import/no-unresolved': 'off', // it should be checked by typescript
    'linebreak-style': 'off',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          '{}': false,
          Object: false,
          object: false,
          Function: false,
        },
        extendDefaults: true,
      },
    ],
    'max-len': [
      'warn',
      {
        code: 80,
        comments: 120,
        ignoreComments: true,
        ignoreStrings: true, // ignores lines that contain a double-quoted or single-quoted string
        ignoreTemplateLiterals: true, // ignores lines that contain a template literal
        ignoreRegExpLiterals: true, // ignores lines that contain a RegExp literal
        tabWidth: 2,
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/adjacent-overload-signatures': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-namespace': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'warn',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-empty-interface': 'off',
    'react/no-unescaped-entities': 'off',
    quotes: [1, 'single', 'avoid-escape'], // TODO: check the options
    'spaced-comment': ['error', 'always'],
    'import/order': [
      'warn',
      {
        groups: [
          // import fs from 'fs';
          'builtin',

          // import _ from 'lodash';
          'external',

          // import foo from 'src/foo';
          'internal',

          // import qux from '../../foo/qux';
          'parent',

          // import main from './';
          'index',

          // import baz from './bar/baz';
          'sibling',
        ],
      },
    ],
  },
};
