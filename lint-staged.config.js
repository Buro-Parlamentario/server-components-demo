module.exports = {
  '*.js': ['prettier --write', 'eslint . --fix'],
  '*.{md,yml,css}': ['prettier --write'],
};
