import { Module } from '@nestjs/common';

import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

import { PrismaModule } from '../prisma/prisma.module';
import { PermissionGuard } from '../common/guards/permission.guard';

@Module({
  imports: [PrismaModule],
  controllers: [StaffController],
  providers: [StaffService, PermissionGuard],
})
export class StaffModule {}