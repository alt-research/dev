module.exports = {
  parser: 'babel-ts',
  semi: true,
  tabWidth: 2,
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'none',
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json'
      }
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown'
      }
    }
  ]
};
