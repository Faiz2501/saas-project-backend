import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsService } from './permissions.service';

@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get()
  getPermissions() {
    return this.permissionsService.getPermissions();
  }

  @Get('roles')
  getRoles() {
    return this.permissionsService.getRoles();
  }

  @Get('assignments')
  getAssignments() {
    return this.permissionsService.getAssignments();
  }
}