module.exports = ({ packageName, devPort = 3000, prodPort = 3014 } = {}) => {
  return {
    scripts: {
      default: `next dev -p ${devPort}`,
      dev: 'nps',
      lint: {
        default: 'next lint --fix',
        no_fix: 'next lint',
      },
      build: {
        default: 'next build',
      },
      start: {
        default: 'next start',
        server: 'PORT=3002 node server.js',
        server_start: `node_modules/next/dist/bin/next start -p ${prodPort}`,
        local: `next start -p  ${prodPort}`,
      },
      prepare: {
        default: 'husky install && next lint',
      },
      debug: "NODE_OPTIONS='--inspect' next dev",
      format: {
        default: 'prettier --write .',
      },
      precommit: 'lint-staged',
    },
  };
};
