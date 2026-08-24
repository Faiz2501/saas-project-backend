import { Module } from '@nestjs/common';

import { SupportController } from './support.controller';
import { SupportService } from './support.service';

import { PrismaModule } from '../prisma/prisma.module';
import { PermissionGuard } from '../common/guards/permission.guard';

@Module({
  imports: [PrismaModule],
  controllers: [SupportController],
  providers: [SupportService, PermissionGuard],
})
export class SupportModule {}