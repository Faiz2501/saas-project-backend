import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { VerificationsController } from './verifications.controller';
import { VerificationsService } from './verifications.service';

import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    WalletModule,
    ApiKeysModule,
  ],
  controllers: [
    VerificationsController,
  ],
  providers: [
    VerificationsService,
  ],
})
export class VerificationsModule {}