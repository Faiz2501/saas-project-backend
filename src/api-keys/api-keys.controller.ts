import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeysService } from './api-keys.service';

@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(
    private readonly apiKeysService: ApiKeysService,
  ) {}

  @Post(':userId')
  generateKey(
    @Param('userId') userId: string,
    @Body()
    body: {
      name: string;
    },
  ) {
    return this.apiKeysService.generateApiKey(userId, body.name);
  }

  @Post('regenerate/:userId')
  regenerateKey(
    @Param('userId') userId: string,
    @Body()
    body: {
      name: string;
    },
  ) {
    return this.apiKeysService.regenerateApiKey(userId, body.name);
  }

  @Patch('deactivate/:id')
  deactivateKey(@Param('id') id: string) {
    return this.apiKeysService.deactivateApiKey(id);
  }

  @Get('analytics/:userId')
  analytics(@Param('userId') userId: string) {
    return this.apiKeysService.getUsageAnalytics(userId);
  }

  @Get('usage/:userId')
  getUsageLogs(@Param('userId') userId: string) {
    return this.apiKeysService.getUsageLogs(userId);
  }

  @Get(':userId')
  getKeys(@Param('userId') userId: string) {
    return this.apiKeysService.getUserKeys(userId);
  }
}