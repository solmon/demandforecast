const { crossEnv } = require('@gowravshekar/nps-utils');

const mainScripts = require('../../scripts/nps/next.package-scripts')({
  packageName: '@app/sales',
  devPort: 3002,
  prodPort: 3002,
});

module.exports = {
  scripts: {
    ...mainScripts.scripts,
    build: {
      default: crossEnv('next build'),
    },
  },
};
