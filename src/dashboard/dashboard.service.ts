import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getCustomerDashboard(
    userId: string,
  ) {
    const wallet =
      await this.prisma.wallet.findUnique({
        where: {
          userId,
        },
      });

    const activeApiKey =
      await this.prisma.apiKey.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });

    const totalRequests =
      await this.prisma.verificationRequest.count({
        where: {
          userId,
        },
      });

    const successfulRequests =
      await this.prisma.verificationRequest.count({
        where: {
          userId,
          status: 'SUCCESS',
        },
      });

    const failedRequests =
      await this.prisma.verificationRequest.count({
        where: {
          userId,
          status: 'FAILED',
        },
      });

    const spent =
      await this.prisma.verificationRequest.aggregate({
        where: {
          userId,
        },
        _sum: {
          amount: true,
        },
      });

    const totalTransactions =
      await this.prisma.walletTransaction.count({
        where: {
          userId,
        },
      });

    const recentVerifications =
      await this.prisma.verificationRequest.findMany({
        where: {
          userId,
        },
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          serviceName: true,
          amount: true,
          status: true,
          createdAt: true,
          errorMessage: true,
        },
      });

    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    const apiCallsToday =
      await this.prisma.verificationRequest.count({
        where: {
          userId,
          createdAt: {
            gte: startOfToday,
          },
        },
      });

    const apiCallsThisMonth =
      await this.prisma.verificationRequest.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });

    const todaySpendData =
      await this.prisma.verificationRequest.aggregate({
        where: {
          userId,
          createdAt: {
            gte: startOfToday,
          },
        },
        _sum: {
          amount: true,
        },
      });

    const monthlySpendData =
      await this.prisma.verificationRequest.aggregate({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      });

    const todaySpend =
      todaySpendData._sum.amount || 0;

    const monthlySpend =
      monthlySpendData._sum.amount || 0;

    const daysElapsed =
      now.getDate();

    const averageDailySpend =
      daysElapsed > 0
        ? Number(
            (
              monthlySpend /
              daysElapsed
            ).toFixed(2),
          )
        : 0;

    const successRate =
      totalRequests === 0
        ? '0%'
        : (
            (successfulRequests /
              totalRequests) *
            100
          ).toFixed(2) + '%';

    return {
      walletBalance:
        wallet?.balance || 0,

      activeApiKey:
        activeApiKey?.apiKey || null,

      totalRequests,

      successfulRequests,

      failedRequests,

      successRate,

      totalSpent:
        spent._sum.amount || 0,

      totalVerifications:
        totalRequests,

      totalTransactions,

      apiCallsToday,

      apiCallsThisMonth,

      todaySpend,

      monthlySpend,

      averageDailySpend,

      recentVerifications,
    };
  }
}