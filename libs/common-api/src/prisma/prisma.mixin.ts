import { to } from '@app/common/src';
import { INestApplication, Logger, OnModuleInit } from '@nestjs/common';
import { getDocumentDbError } from '../exceptions';

// Inspired by https://github.com/microsoft/TypeScript/issues/37142#issuecomment-1251357562
interface PrismaClient {
  $on: (eventType, callback) => void;
  $connect: () => Promise<void>;
  $use: (cb) => void;
}

type Constructor<TResult, TParams extends any[] = any[]> = new (...params: TParams) => TResult;

// Inspired by https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/#subclassfactorieswiththisoneweirdtrick
export const PrismaMixin = <TBase extends Constructor<PrismaClient>>(superclass: TBase): TBase =>
  class extends superclass implements OnModuleInit {
    readonly logger = new Logger(PrismaMixin.name);

    async onModuleInit() {
      this.logger.log('prisma connection try');
      const [error] = await to(this.$connect());
      if (error) {
        this.logger.error(error);
      } else {
        this.logger.log('prisma connected');
        this.$use(async (params, next) => {
          const startTime = process.hrtime.bigint();
          const [error, result] = await to(next(params));
          this.logger.log({
            model: params.model,
            action: params.action,
            runInTransaction: params.runInTransaction,
            responseTime: Number(process.hrtime.bigint() - startTime) / 1_000_000,
          });
          if (error) {
            this.logger.error(error);
            // eslint-disable-next-line functional/no-throw-statements
            throw getDocumentDbError({ error });
          }
          return result;
        });
      }
    }

    enableShutdownHooks(app: INestApplication) {
      this.$on('beforeExit', async () => {
        this.logger.log('prisma closed');
        await app.close();
      });
    }
  };
