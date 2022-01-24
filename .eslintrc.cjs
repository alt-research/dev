const base = require('@alt-research/dev/config/eslint.cjs');

module.exports = {
  ...base,
  ignorePatterns: [
    ...base.ignorePatterns,
    'all-deps.js',
    'tester.cjs',
    'tester.mjs'
  ],
  parserOptions: {
    ...base.parserOptions,
    project: [
      './tsconfig.eslint.json'
    ]
  }
};
