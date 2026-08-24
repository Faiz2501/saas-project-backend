import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createWebhook(
    userId: string,
    url: string,
  ) {
    return this.prisma.webhook.create({
      data: {
        userId,
        url,
      },
    });
  }

  async getUserWebhooks(
    userId: string,
  ) {
    return this.prisma.webhook.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async toggleWebhook(
    webhookId: string,
  ) {
    const webhook =
      await this.prisma.webhook.findUnique({
        where: {
          id: webhookId,
        },
      });

    return this.prisma.webhook.update({
      where: {
        id: webhookId,
      },
      data: {
        isActive:
          !webhook?.isActive,
      },
    });
  }

  async deleteWebhook(
    webhookId: string,
  ) {
    return this.prisma.webhook.delete({
      where: {
        id: webhookId,
      },
    });
  }
}