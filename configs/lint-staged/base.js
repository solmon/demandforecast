module.exports = {
  './{src,test}/**/*.ts': ['eslint --fix --cache', 'prettier --write'],
  '**/*.{ts,js,md,json}': 'prettier --write',
  '**/*.{ts,js,tsx, jsx}': ['eslint --fix --cache', 'prettier --write'],
  '**/*.{css, scss}': 'prettier --write',
};
