import path from 'path';
import { defineConfig } from 'eslint-define-config';
import typescriptParser from '@typescript-eslint/parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import functionalPlugin from 'eslint-plugin-functional';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';
import promisePlugin from 'eslint-plugin-promise';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintPlugin from "@eslint/js";

const thisDir = path.resolve();

export default defineConfig({
  files: ["**/*.ts"],
  ignores: ['.eslintrc.js'],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      project: path.join(thisDir, 'tsconfig.eslint.json'),
      tsconfigRootDir: thisDir,
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    globals: {
      node: true,  // Define global variables here
      es2022: true,
    },
  },
  plugins: {
    '@typescript-eslint': typescriptEslint,
    import: importPlugin,
    functional: functionalPlugin,
    sonarjs: sonarjsPlugin,
    unicorn: unicornPlugin,
    promise: promisePlugin,
    prettier: prettierPlugin,
  },
  rules: {
    ...eslintPlugin.configs.recommended.rules,
    ...typescriptEslint.configs['eslint-recommended'].rules,
    ...typescriptEslint.configs.recommended.rules,
    ...typescriptEslint.configs.strict.rules,
    ...prettierPlugin.configs.recommended.rules,
    // ...importPlugin.configs.recommended.rules,
    // ...importPlugin.configs.typescript.rules,
    ...functionalPlugin.configs.noExceptions.rules,
    ...functionalPlugin.configs.stylistic.rules,
    ...sonarjsPlugin.configs.recommended.rules,
    ...unicornPlugin.configs.recommended.rules,
    ...promisePlugin.configs.recommended.rules,
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'error',
    // Note: you must disable the base rule as it can report incorrect errors
    "require-await": 'off',
    "@typescript-eslint/require-await": 'error',

    // sonarjs
    'sonarjs/cognitive-complexity': 'warn',
    'sonarjs/no-duplicate-string': 'off',
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/todo-tag': 'off',
    'sonarjs/deprecation': 'warn',
    'sonarjs/function-return-type': 'off',
    // Check below two and remove them post fixing errors.
    'sonarjs/no-empty-function': 'off',
    'sonarjs/no-unused-expressions': 'off',

    // possible errors
    'for-direction': 'error',
    'no-prototype-builtins': 'error',
    'no-template-curly-in-string': 'error',
    'no-unsafe-negation': 'error',

    // best practices
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    complexity: 'error',
    'consistent-return': 'error',
    eqeqeq: ['error', 'smart'],
    'guard-for-in': 'error',
    'no-alert': 'error',
    'no-caller': 'error',
    'no-div-regex': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-proto': 'error',
    'no-restricted-properties': 'error',
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    radix: 'error',
    'wrap-iife': 'error',
    yoda: 'error',

    // stylistic
    camelcase: 'off',
    'consistent-this': ['warn', 'that'],
    'func-name-matching': 'error',
    'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'max-depth': 'warn',
    'max-lines': ['warn', 1000],
    'max-params': ['warn', 4],
    'no-array-constructor': 'warn',
    'no-bitwise': 'warn',
    'no-lonely-if': 'error',
    'no-multi-assign': 'warn',
    'no-nested-ternary': 'warn',
    'no-new-object': 'warn',
    'no-unneeded-ternary': 'warn',
    'one-var': ['warn', 'never'],
    'operator-assignment': 'warn',
    'padding-line-between-statements': 'error',

    // es2015
    'no-useless-computed-key': 'error',
    'no-useless-rename': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-destructuring': ['warn', { object: true, array: false }],
    'prefer-numeric-literals': 'warn',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',

    // disabled because of the usage of typescript-eslint-parser
    // https://github.com/eslint/typescript-eslint-parser/issues/77
    'no-undef': 'off',

    // // import
    // 'import/first': 'error',
    // 'import/newline-after-import': 'error',
    // 'import/no-absolute-path': 'error',
    // 'import/no-amd': 'error',
    // 'import/no-deprecated': 'error',
    // 'import/no-duplicates': 'error',
    // 'import/no-mutable-exports': 'error',
    // 'import/no-named-as-default': 'error',
    // 'import/no-named-as-default-member': 'error',
    // 'import/no-named-default': 'error',
    // 'import/no-unresolved': 'off',

    // unicorn
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-useless-promise-resolve-reject': 'off',
    'unicorn/consistent-function-scoping': 'off',
    'unicorn/prefer-dom-node-text-content': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-nested-ternary': 'warn',
    'unicorn/prefer-query-selector': 'off',

    // promise
    'promise/no-return-wrap': 'off',
  },
  settings: {
    react: {
      version: 'detect', // Automatically detects the React version
    },
  },
});