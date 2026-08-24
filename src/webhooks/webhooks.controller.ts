import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService:
      WebhooksService,
  ) {}

  @Post('create')
  createWebhook(
    @Body()
    body: {
      userId: string;
      url: string;
    },
  ) {
    return this.webhooksService.createWebhook(
      body.userId,
      body.url,
    );
  }

  @Get('user/:userId')
  getUserWebhooks(
    @Param('userId')
    userId: string,
  ) {
    return this.webhooksService.getUserWebhooks(
      userId,
    );
  }

  @Patch(':webhookId/toggle')
  toggleWebhook(
    @Param('webhookId')
    webhookId: string,
  ) {
    return this.webhooksService.toggleWebhook(
      webhookId,
    );
  }

  @Delete(':webhookId')
  deleteWebhook(
    @Param('webhookId')
    webhookId: string,
  ) {
    return this.webhooksService.deleteWebhook(
      webhookId,
    );
  }
}