import { Property } from '@app/common/src';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ErrorCode } from './error-code.enum';

export const getDocumentDbError = ({ error }: Readonly<{ error: Error }>): HttpException => {
  if (error instanceof PrismaClientKnownRequestError) {
    return new KnownRequestException({ code: error.code });
  }
  if (error instanceof PrismaClientValidationError) {
    return new InvalidDbPayloadException();
  }
  return new UnknownException();
};

/**
 * Reasons
 *
 */
class KnownRequestException extends InternalServerErrorException {
  constructor({ code }: Readonly<{ code: string }>) {
    const codeToErrorCode = {
      P2031: ErrorCode.DbStandalone,
      P2002: ErrorCode.DbUniqueConstraint,
      P1013: ErrorCode.DbConnectionRefused,
      P2023: ErrorCode.DbRecordNotFound,
    };
    const errorCode = Property.has(codeToErrorCode, code) ? codeToErrorCode[code] : ErrorCode.DbUnknown;
    super({ error: 'Database request error', errorCode, code });
  }
}

/**
 * Reasons
 * - Document database unknown error
 */
class UnknownException extends InternalServerErrorException {
  constructor() {
    super({ error: 'Error occured during a database operation', errorCode: ErrorCode.DbUnknown });
  }
}

/**
 * Reasons
 * - Validation of payload at db level failed
 */

class InvalidDbPayloadException extends InternalServerErrorException {
  constructor() {
    super({ error: 'Entered values in database are invalid', errorCode: ErrorCode.DbInvalidEntry });
  }
}
