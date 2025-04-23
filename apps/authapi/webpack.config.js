const path = require('path');
const dotenv = require('dotenv');
const {
  getOptions,
  getPlugins,
} = require('../../scripts/webpack/nest-http-api.webpack.config');

// Determine environment and load appropriate .env file
const env = process.env.NODE_ENV || 'development';
const dotenvPath = path.resolve(__dirname, `.env.${env}`);

// Immediately load environment variables at the beginning of the build process
dotenv.config({ path: dotenvPath });
console.log(`Loading authapi environment from: ${dotenvPath}`);

module.exports = function (options, webpack) {
  return {
    ...options,
    ...getOptions(),
    plugins: [
      ...options.plugins, 
      ...getPlugins({ 
        options, 
        webpack,
        dotenvConfig: {
          path: dotenvPath,
          safe: false, // load '.env.example' to verify the '.env' variables are all set
          systemvars: true, // load all system variables as well
          defaults: false // load '.env.defaults' as the default values if empty
        }
      })
    ],
  };
};
