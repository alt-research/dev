const fs = require('fs');
const { defaults } = require('jest-config');

module.exports = {
  // See https://jestjs.io/docs/configuration#extraglobals-arraystring
  extraGlobals: ['Math'],
  moduleFileExtensions: [
    ...defaults.moduleFileExtensions,
    'ts',
    'tsx'
  ],
  modulePathIgnorePatterns: ['<rootDir>/build'].concat(
    fs
      .readdirSync('packages')
      .filter((p) => fs.statSync(`packages/${p}`).isDirectory())
      .map((p) => `<rootDir>/packages/${p}/build`)
  ),
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': require.resolve('babel-jest')
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@alt-research|@babel/runtime/helpers/esm/)'
  ]
};
