import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permission } from '../common/decorators/permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @Request() req,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      email?: string;
    },
  ) {
    return this.usersService.updateProfile(
      req.user.sub,
      body,
    );
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('VIEW_USERS')
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('VIEW_USERS')
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('MANAGE_STAFF')
  @Patch(':id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body()
    body: {
      role: string;
    },
  ) {
    return this.usersService.updateUserRole(
      id,
      body.role,
    );
  }
}