import dotenv from 'dotenv';

// Load environment variables from .env.local
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: envFile });
console.info(`Loaded environment variables from ${envFile}`);

/**
 * Helper function to get environment variables with a default fallback.
 * @param key - The key of the environment variable.
 * @param defaultValue - The default value to return if the variable is not set.
 * @returns The value of the environment variable or the default value.
 */
export function getEnvVariable(key: string, defaultValue: string = ''): string {
  const value = process.env[key];
  if (value === undefined) {
    console.warn(`Environment variable ${key} is not set. Using default value: ${defaultValue}`);
    return defaultValue;
  }
  return value;
}
