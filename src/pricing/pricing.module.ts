import { Module } from '@nestjs/common';

import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';

import { PrismaModule } from '../prisma/prisma.module';
import { PermissionGuard } from '../common/guards/permission.guard';

@Module({
  imports: [PrismaModule],
  controllers: [PricingController],
  providers: [PricingService, PermissionGuard],
})
export class PricingModule {}