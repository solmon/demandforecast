const { crossEnv } = require('@gowravshekar/nps-utils');

const mainScripts = require('../../scripts/nps/next.package-scripts')({
  packageName: '@app/lander',
  devPort: 3001,
  prodPort: 3001,
});

module.exports = {
  scripts: {
    ...mainScripts.scripts,
    build: {
      default: crossEnv('next build'),
    },
  },
};
