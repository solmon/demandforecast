import path from 'path';
import { defineConfig } from 'eslint-define-config';
import baseConfig from '../../eslint.config.mjs';

const thisDir = path.resolve();

export default defineConfig({
  ...baseConfig,
  languageOptions: {
    ...baseConfig.languageOptions,
    parserOptions: {
      ...baseConfig.languageOptions.parserOptions,
      project: path.join(thisDir, 'tsconfig.json'), // Ensure this path is correct
      tsconfigRootDir: thisDir,
    },
    globals: {
      node: true,
      jest: true,
    }
  },
});