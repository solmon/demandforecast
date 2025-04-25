import { HttpApiSettings } from '@app/common-api/src';

export interface EnvironmentVariables extends HttpApiSettings {
  // JWT Configuration
  JWT_SECRET: string;
  JWT_EXPIRES_IN?: string;
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  
  // GitHub OAuth Configuration
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_CALLBACK_URL: string;
  
  // HiBob Integration Configuration
  HIBOB_API_KEY: string;
  HIBOB_API_URL: string;
  HIBOB_WEBHOOK_SECRET: string;
}
