import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async generateApiKey(
    userId: string,
    name: string,
  ) {
    await this.prisma.apiKey.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const apiKey =
      'sk_' +
      randomUUID().replace(/-/g, '');

    const key = await this.prisma.apiKey.create({
      data: {
        userId,
        name,
        apiKey,
        isActive: true,
      },
    });

    this.notificationsService.create(
      userId,
      'API_KEY_CREATED',
      'API Key Generated',
      `Your new API key "${name}" has been created and is now active.`,
      { keyId: key.id, name },
    );

    return key;
  }

  async regenerateApiKey(
    userId: string,
    name: string,
  ) {
    await this.prisma.apiKey.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const apiKey =
      'sk_' +
      randomUUID().replace(/-/g, '');

    const key = await this.prisma.apiKey.create({
      data: {
        userId,
        name,
        apiKey,
        isActive: true,
      },
    });

    this.notificationsService.create(
      userId,
      'API_KEY_ROTATED',
      'API Key Rotated',
      `Your API key "${name}" has been rotated. The previous key is now inactive.`,
      { keyId: key.id, name },
    );

    return key;
  }

  async deactivateApiKey(id: string) {
    const key = await this.prisma.apiKey.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });

    this.notificationsService.create(
      key.userId,
      'API_KEY_DEACTIVATED',
      'API Key Deactivated',
      `Your API key "${key.name ?? id}" has been deactivated.`,
      { keyId: id, name: key.name },
    );

    return key;
  }

  async getUserKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUsageLogs(userId: string) {
    return this.prisma.verificationRequest.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        serviceName: true,
        amount: true,
        status: true,
        createdAt: true,
        errorMessage: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUsageAnalytics(userId: string) {
    const requests =
      await this.prisma.verificationRequest.findMany({
        where: {
          userId,
        },
      });

    const totalRequests =
      requests.length;

    const successfulRequests =
      requests.filter(
        (r) => r.status === 'SUCCESS',
      ).length;

    const failedRequests =
      requests.filter(
        (r) => r.status === 'FAILED',
      ).length;

    const totalSpent =
      requests.reduce(
        (sum, r) => sum + r.amount,
        0,
      );

    const servicesUsed: Record<
      string,
      number
    > = {};

    requests.forEach((r) => {
      servicesUsed[r.serviceName] =
        (servicesUsed[r.serviceName] || 0) + 1;
    });

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      totalSpent,
      successRate:
        totalRequests === 0
          ? '0%'
          : (
              (successfulRequests /
                totalRequests) *
              100
            ).toFixed(2) + '%',
      servicesUsed,
    };
  }

  async validateApiKey(apiKey: string) {
    return this.prisma.apiKey.findFirst({
      where: {
        apiKey,
        isActive: true,
      },
    });
  }
}