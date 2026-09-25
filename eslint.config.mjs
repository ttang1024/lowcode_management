// ESLint flat config (ESLint 9+). Ported from the former `.eslintrc.js`.
// `eslint-config-google` is eslintrc-only, so it is loaded through FlatCompat;
// the TypeScript/React plugins and the project's custom rules are layered on top.
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // Replaces .eslintignore (flat config no longer reads that file).
  {
    ignores: [
      'src/web/lowcode-ui/src/lowcode-icon/icon/iconfont.js',
      'packages/lowcode-webpack-plugin/hot/**',
      'dist/**',
      'packages/*/lib/**',
      '**/node_modules/**',
    ],
  },
  // Base style guide (eslintrc-only package, loaded via compat). It still sets
  // `require-jsdoc`/`valid-jsdoc`, which ESLint 9 removed, so drop those.
  ...compat.extends('google').map(({ rules = {}, ...config }) => ({
    ...config,
    rules: Object.fromEntries(Object.entries(rules).filter(([name]) => !/^(require|valid)-jsdoc$/.test(name))),
  })),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { legacyDecorators: true, jsx: true },
        // Mirror tsconfig so consistent-type-imports leaves decorated files alone:
        // their imported param/property types feed `design:*` metadata at runtime.
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // plugin:react/recommended (brought in explicitly so the react plugin
      // namespace resolves within this config object).
      ...reactPlugin.configs.recommended.rules,

      'new-cap': 0,
      'eol-last': 0,
      'max-len': 0,
      'prefer-promise-reject-errors': 0,
      'arrow-parens': 0,
      'no-invalid-this': 0,
      'react/jsx-uses-react': 0,
      'react/react-in-jsx-scope': 0,
      'react/sort-comp': 0,
      'no-mixed-spaces-and-tabs': 1,
      'no-alert': 1,
      'no-multi-spaces': 2,
      'no-else-return': 2,
      'no-multi-str': 2,
      'no-redeclare': 2,
      'no-useless-escape': 2,
      'no-useless-catch': 1,
      'no-useless-concat': 1,
      'no-useless-return': 2,
      // Defer unused-vars detection to the TypeScript-aware rule; the base rule
      // double-reports and misfires on types, enums and decorator metadata.
      'no-unused-vars': 0,
      '@typescript-eslint/no-unused-vars': [1, {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        // The former @typescript-eslint v5 defaulted caughtErrors to 'none';
        // keep that behaviour so the upgrade doesn't flag unused catch bindings.
        caughtErrors: 'none',
        ignoreRestSiblings: true,
      }],
      // Type-only imports must use `import type` so they are erased at build time.
      '@typescript-eslint/consistent-type-imports': [2, { fixStyle: 'inline-type-imports', disallowTypeAnnotations: false }],
      // ...and an import whose specifiers are all types uses the top-level `import type` form.
      '@typescript-eslint/no-import-type-side-effects': 2,
      'array-bracket-spacing': 2,
      'comma-spacing': 2,
      'comma-style': 2,
      'computed-property-spacing': 2,
      'func-call-spacing': 2,
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'jsx-quotes': ['error', 'prefer-double'],
      'quotes': ['error', 'single'],
      'key-spacing': 2,
      'no-trailing-spaces': 2,
      'semi': 2,
      'space-before-blocks': 2,
      'block-spacing': 2,
      'no-multiple-empty-lines': 2,
      'space-before-function-paren': ['error', 'never'],
      '@typescript-eslint/no-use-before-define': 0,
      'object-curly-spacing': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'react/jsx-closing-bracket-location': 2,
      'react/jsx-closing-tag-location': 2,
      'react/jsx-curly-newline': 2,
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      'react/jsx-wrap-multilines': 2,
      'react/prop-types': [2, { ignore: ['children'] }],
      'react/no-unused-state': 1,
    },
  },
];
