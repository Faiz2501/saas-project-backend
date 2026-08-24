import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';

import {
  ThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';

import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { WalletModule } from './wallet/wallet.module';
import { PricingModule } from './pricing/pricing.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { VerificationsModule } from './verifications/verifications.module';
import { StaffModule } from './staff/staff.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { SupportModule } from './support/support.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    PrismaModule,
    AuthModule,
    UsersModule,
    WalletModule,
    PricingModule,
    TransactionsModule,
    ApiKeysModule,
    VerificationsModule,
    StaffModule,
    PermissionsModule,
    RazorpayModule,
    SupportModule,
    DashboardModule,
    AdminModule,
    WebhooksModule,
    HealthModule,
    NotificationsModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}