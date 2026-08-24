import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getOverview() {
    const totalUsers =
      await this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
        },
      });

    const totalStaff =
      await this.prisma.user.count({
        where: {
          role: 'STAFF',
        },
      });

    const totalVerifications =
      await this.prisma.verificationRequest.count();

    const totalTransactions =
      await this.prisma.walletTransaction.count();

    const activeApiKeys =
      await this.prisma.apiKey.count({
        where: {
          isActive: true,
        },
      });

    const revenue =
      await this.prisma.walletTransaction.aggregate({
        where: {
          type: 'DEBIT',
        },
        _sum: {
          amount: true,
        },
      });

    return {
      totalUsers,
      totalStaff,
      totalVerifications,
      totalTransactions,
      activeApiKeys,
      totalRevenue:
        revenue._sum.amount || 0,
    };
  }

  async getUsers() {
    const users =
      await this.prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          wallet: {
            select: {
              balance: true,
            },
          },
          _count: {
            select: {
              apiKeys: true,
              verifications: true,
              transactions: true,
              staffPermissions: true,
            },
          },
        },
      });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      walletBalance:
        user.wallet?.balance || 0,
      apiKeyCount: user._count.apiKeys,
      verificationCount:
        user._count.verifications,
      transactionCount:
        user._count.transactions,
      permissionCount:
        user._count.staffPermissions,
    }));
  }

  async getUserDetail(userId: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          wallet: true,
          apiKeys: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          verifications: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 20,
          },
          transactions: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 20,
          },
          staffPermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return {
      ...user,
      walletBalance:
        user.wallet?.balance || 0,
      activeApiKeys:
        user.apiKeys.filter(
          (key) => key.isActive,
        ).length,
      totalApiKeys: user.apiKeys.length,
      totalVerifications:
        user.verifications.length,
      totalTransactions:
        user.transactions.length,
      permissions: user.staffPermissions.map(
        (sp) => sp.permission.name,
      ),
    };
  }

  async getRevenueAnalytics() {
    const credits =
      await this.prisma.walletTransaction.aggregate({
        where: {
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
          type: 'DEBIT',
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });

    return {
      totalCredits:
        credits._sum.amount || 0,
      totalCreditTransactions:
        credits._count,
      totalDebits:
        debits._sum.amount || 0,
      totalDebitTransactions:
        debits._count,
      profit:
        debits._sum.amount || 0,
    };
  }

  async getRecentTransactions() {
    return this.prisma.walletTransaction.findMany({
      take: 50,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getVerificationAnalytics() {
    const total =
      await this.prisma.verificationRequest.count();

    const success =
      await this.prisma.verificationRequest.count({
        where: {
          status: 'SUCCESS',
        },
      });

    const failed =
      await this.prisma.verificationRequest.count({
        where: {
          status: 'FAILED',
        },
      });

    return {
      total,
      success,
      failed,
    };
  }

  async getAllTickets(options?: { status?: string }) {
  const tickets = await this.prisma.supportTicket.findMany({
    where: options?.status
      ? {
          status: options.status,
        }
      : undefined,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  } as any);

  return tickets.map((ticket) => {
    const user = ticket.userId as {
      email?: string;
      role?: string;
      firstName?: string;
      lastName?: string;
    } | null;

    const fullName = [
      user?.firstName,
      user?.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      ...ticket,
      customerName: fullName || user?.email || 'Unnamed User',
      customerEmail: user?.email || '',
      userRole: user?.role || '',
    };
  });
}
async getTicketById(ticketId: string) {
  const ticket = await this.prisma.supportTicket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundException('Support ticket not found');
  }

  const user = ticket.user as {
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  } | null;

  const fullName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    ...ticket,
    customerName: fullName || user?.email || 'Unnamed User',
    customerEmail: user?.email || '',
    userRole: user?.role || '',
  };
}
}