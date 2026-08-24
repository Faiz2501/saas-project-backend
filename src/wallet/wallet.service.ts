import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getWallet(userId: string) {
    let wallet =
      await this.prisma.wallet.findUnique({
        where: {
          userId,
        },
      });

    if (!wallet) {
      wallet =
        await this.prisma.wallet.create({
          data: {
            userId,
            balance: 0,
          },
        });
    }

    return wallet;
  }

  async creditWallet(
    userId: string,
    amount: number,
    description = 'Wallet Credit',
  ) {
    await this.getWallet(userId);

    const updatedWallet =
      await this.prisma.wallet.update({
        where: {
          userId,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

    await this.prisma.walletTransaction.create({
      data: {
        userId,
        amount,
        type: 'CREDIT',
        description,
      },
    });

    this.notificationsService.create(
      userId,
      'WALLET_CREDITED',
      'Wallet Credited',
      `₹${amount} has been added to your wallet. ${description}`,
      { amount, description },
    );

    return updatedWallet;
  }

  async debitWallet(
    userId: string,
    amount: number,
    description = 'Wallet Debit',
  ) {
    const wallet =
      await this.getWallet(userId);

    if (wallet.balance < amount) {
      throw new BadRequestException(
        'Insufficient wallet balance, please recharge',
      );
    }

    const updatedWallet =
      await this.prisma.wallet.update({
        where: {
          userId,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

    await this.prisma.walletTransaction.create({
      data: {
        userId,
        amount,
        type: 'DEBIT',
        description,
      },
    });

    this.notificationsService.create(
      userId,
      'WALLET_DEBITED',
      'Wallet Debited',
      `₹${amount} has been deducted from your wallet. ${description}`,
      { amount, description },
    );

    return updatedWallet;
  }

  async getTransactions(userId: string) {
    return this.prisma.walletTransaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getWalletSummary(userId: string) {
    const wallet =
      await this.getWallet(userId);

    const credits =
      await this.prisma.walletTransaction.aggregate({
        where: {
          userId,
          type: 'CREDIT',
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });

    const debits =
      await this.prisma.walletTransaction.aggregate({
        where: {
          userId,
          type: 'DEBIT',
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });

    const latestRecharge =
      await this.prisma.walletTransaction.findFirst({
        where: {
          userId,
          type: 'CREDIT',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return {
      balance: wallet.balance,

      totalCredits:
        credits._sum.amount || 0,

      totalDebits:
        debits._sum.amount || 0,

      creditTransactions:
        credits._count,

      debitTransactions:
        debits._count,

      totalTransactions:
        credits._count + debits._count,

      totalRechargeAmount:
        credits._sum.amount || 0,

      latestRecharge,
    };
  }
}