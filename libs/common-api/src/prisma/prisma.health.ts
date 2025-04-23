import { to } from '@app/common/src';
import { Logger } from '@nestjs/common';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

// Extracted from '@nestjs/terminus'

declare type HealthIndicatorStatus = 'up' | 'down';

type HealthIndicatorResult = Record<
  string,
  {
    /**
     * The status if the given health indicator was successful or not
     */
    status: HealthIndicatorStatus;
    /**
     * Optional settings of the health indicator result
     */
    [optionalKeys: string]: any;
  }
>;

const logger = new Logger('PrismaHealthIndicator');

export const pingDatabase = async <T extends { $connect: () => Promise<void> }>({
  prismaService,
  key,
  success,
  failure,
}: Readonly<{
  prismaService: T;
  key: string;
  success: () => HealthIndicatorResult;
  failure: (message, cause) => Error;
}>): Promise<HealthIndicatorResult> => {
  const [error] = await to(prismaService.$connect());
  if (error) {
    logger.error(error);
    const result = {
      status: 'down',
      message: error.message,
      clientVersion: (error as PrismaClientInitializationError).clientVersion,
      errorCode: (error as PrismaClientInitializationError).errorCode,
    };
    return Promise.reject(failure(`Database connection for ${key} failed`, { [key]: result }));
  }
  return success();
};
