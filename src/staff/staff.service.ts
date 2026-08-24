import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createStaff(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

    if (existingUser) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(data.password, 10);

    const user =
      await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'STAFF',
        },
      });

    return {
      message: 'Staff created successfully',
      user,
    };
  }

  async getAllStaff() {
    return this.prisma.user.findMany({
      where: {
        role: 'STAFF',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async assignPermission(
    userId: string,
    permissionId: string,
  ) {
    return this.prisma.staffPermission.create({
      data: {
        userId,
        permissionId,
      },
    });
  }

  async setPermissions(
    userId: string,
    permissionIds: string[],
  ) {
    await this.prisma.staffPermission.deleteMany({
      where: {
        userId,
      },
    });

    if (!permissionIds.length) {
      this.notificationsService.create(
        userId,
        'PERMISSIONS_UPDATED',
        'Permissions Updated',
        'Your account permissions have been cleared by an administrator.',
        { permissionIds: [] },
      );

      return {
        message:
          'Permissions cleared successfully',
      };
    }

    const result = await this.prisma.staffPermission.createMany({
      data: permissionIds.map(
        (permissionId) => ({
          userId,
          permissionId,
        }),
      ),
    });

    this.notificationsService.create(
      userId,
      'PERMISSIONS_UPDATED',
      'Permissions Updated',
      'Your account permissions have been updated by an administrator.',
      { permissionIds },
    );

    return result;
  }

  async getStaffPermissions() {
    return this.prisma.staffPermission.findMany({
      include: {
        user: true,
        permission: true,
      },
    });
  }
}