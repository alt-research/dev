// ordering here important (at least from a rule maintenance pov)
/* eslint-disable sort-keys */

require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true
  },
  ignorePatterns: [
    '**/build/*',
    '**/coverage/*',
    '**/node_modules/*',
    '.eslintrc.cjs',
    '.eslintrc.js',
    '.eslintrc.mjs',
    '.github/**',
    '.prettierrc.cjs',
    '.vscode/**',
    '.yarn/**',
    'babel.config.cjs',
    'jest.config.cjs',
    'rollup.config.js',
    'rollup.config.mjs'
  ],
  extends: [
    'eslint:recommended',
    require.resolve('eslint-config-standard'),
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended'
  ],
  overrides: [
    {
      files: ['*.js', '*.cjs', '*.mjs'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off'
      }
    }
  ],
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    extraFileExtensions: ['.cjs', '.mjs'],
    warnOnUnsupportedTypeScriptVersion: false
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
    'import',
    'import-newlines',
    'react-hooks',
    'simple-import-sort',
    'jsx-a11y',
    'sort-destructure-keys'
  ],
  rules: {
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    // required as 'off' since typescript-eslint has own versions
    indent: 'off',
    'no-use-before-define': 'off',
    // rules from semistandard (don't include it, has standard dep version mismatch)
    semi: [2, 'always'],
    'no-extra-semi': 2,
    'space-before-function-paren': 'off',
    // specific overrides
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/type-annotation-spacing': 'error',
    'arrow-parens': ['error', 'always'],
    'default-param-last': [0], // conflicts with TS version (this one doesn't allow TS ?)
    'header/header': 'off',
    'multiline-ternary': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      { blankLine: 'always', prev: '*', next: 'block-like' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: 'function' },
      { blankLine: 'always', prev: 'function', next: '*' },
      { blankLine: 'always', prev: '*', next: 'try' },
      { blankLine: 'always', prev: 'try', next: '*' },
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: '*', next: 'import' },
      { blankLine: 'always', prev: 'import', next: '*' },
      { blankLine: 'any', prev: 'import', next: 'import' }
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/jsx-sort-props': [
      2,
      {
        noSortAlphabetically: false
      }
    ],
    'sort-destructure-keys/sort-destructure-keys': [
      2,
      {
        caseSensitive: true
      }
    ],
    'simple-import-sort/imports': [
      2,
      {
        groups: [
          ['^\u0000'], // all side-effects (0 at start)
          ['\u0000$', '^@alt-research.*\u0000$', '^\\..*\u0000$'], // types (0 at end)
          ['^[^/\\.]'], // non-alt-research
          ['^@alt-research'], // alt-research
          ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'] // local (. last)
        ]
      }
    ],
    'sort-keys': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off'
  },
  settings: {
    'import/extensions': ['.js', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': require.resolve('eslint-import-resolver-node'),
    react: {
      version: 'detect'
    }
  }
};
