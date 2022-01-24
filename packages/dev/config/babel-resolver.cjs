module.exports = function resolver (input) {
  return Array.isArray(input)
    ? input
      .filter((plugin) => !!plugin)
      .map((plugin) =>
        Array.isArray(plugin)
          ? [require.resolve(plugin[0]), plugin[1]]
          : require.resolve(plugin)
      )
    : require.resolve(input);
};
