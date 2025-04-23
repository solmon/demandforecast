import type { LevelWithSilent } from 'pino';

/**
 * Interface representing the application settings.
 */
export interface AppSettings {
  /**
   * Port in which the application runs.
   */
  readonly APP_PORT: number;
  /**
   * Default log level.
   */
  readonly LOG_LEVEL: LevelWithSilent;
}

/**
 * Settings for the HTTP API, including app settings.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HttpApiSettings extends AppSettings {}
