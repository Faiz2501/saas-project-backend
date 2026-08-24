import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getProfile(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      staffPermissions: {
        include: {
          permission: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const permissions = user.staffPermissions.map(
    (sp) => sp.permission.name,
  );

  return {
    ...user,
    permissions,
  };
}

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
    },
  ) {
    if (data.email) {
      const existingUser =
        await this.prisma.user.findFirst({
          where: {
            email: data.email,
            NOT: {
              id: userId,
            },
          },
        });

      if (existingUser) {
        throw new BadRequestException(
          'Email already exists',
        );
      }
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateUserRole(
    id: string,
    role: string,
  ) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        role: role as any,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }

  // GET ALL USERS
  async getAllUsers() {
    return this.prisma.user.findMany({
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

        wallet: {
          select: {
            balance: true,
          },
        },
      },
    });
  }

  // GET USER BY ID
  async getUserById(id: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
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

          apiKeys: {
            select: {
              id: true,
              name: true,
              isActive: true,
              createdAt: true,
            },
          },

          staffPermissions: {
            include: {
              permission: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          verifications: {
            take: 10,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return user;
  }
}