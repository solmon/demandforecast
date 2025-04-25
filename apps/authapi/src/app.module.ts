import { configModule, loggerModule } from '@app/common-api/src';
import { Module } from '@nestjs/common';
import { configSchema } from './config/config-schema';
import { APP_NAME } from './config/constants';
import { DomainModule } from './modules/domain/domain.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    configModule({ configSchema }),
    loggerModule({ name: APP_NAME }),
    DomainModule,
    AuthModule
  ],
})
export class AppModule {}
