import { GatewayTimeoutException, InternalServerErrorException } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';

// Thrown when there is an issue in connecting to any 3rd party service
export class CustomServiceUnavailableException<
  T extends Readonly<Record<number, string>>,
> extends GatewayTimeoutException {
  constructor({ error, errorCode }: Readonly<{ error: string; errorCode: T }>) {
    super({ error, errorCode });
  }
}

/**
 * Custom exception for Internal Server Error (5xx) responses.
 * @template T - The type of the error code object.
 */
export class CustomInternalServerException<
  T extends Readonly<Record<number, string>>,
> extends InternalServerErrorException {
  constructor({ error, errorCode }: Readonly<{ error: string; errorCode: T }>) {
    super({ error, errorCode });
  }
}

/**
 * Exception for internal server errors related to code errors.
 */
export class CodeErrorInternalServerException extends InternalServerErrorException {
  constructor({ error }: Readonly<{ error: string }>) {
    super({ error, errorCode: ErrorCode.CodeError });
  }
}

/**
 * Exception for unclassified internal server errors.
 */
export class UnclassifiedInternalServerException extends InternalServerErrorException {
  constructor({ error }: Readonly<{ error?: string }>) {
    super({ error, errorCode: ErrorCode.Unclassified });
  }
}
