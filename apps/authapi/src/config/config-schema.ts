import { httpApiConfigSchema } from '@app/common-api/src';
import Joi from 'joi';
import { EnvironmentVariables } from './types';

export const configSchema: {
  readonly [k in keyof EnvironmentVariables]: Joi.AnySchema;
} = {
  ...httpApiConfigSchema({ port: 4001 }),
  
  // JWT Configuration
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),
  
  // GitHub OAuth Configuration
  GITHUB_CLIENT_ID: Joi.string().required(),
  GITHUB_CLIENT_SECRET: Joi.string().required(),
  GITHUB_CALLBACK_URL: Joi.string().uri().required(),
    
};
