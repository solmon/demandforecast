module.exports = () => {
  return {
    scripts: {
      default: 'nps lint',
      dev: 'nps',
      lint: {
        default: 'eslint --fix',
      },
      precommit:"lint-staged",
      format: {
        default: 'prettier --write .',
      },
    },
  };
};
