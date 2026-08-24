import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const permission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (request.user?.role === 'SUPER_ADMIN') {
      return true;
    }

    const userId =
      request.user?.sub ||
      request.user?.id ||
      request.headers['user-id'];

    if (!userId) {
      throw new UnauthorizedException('Missing authentication');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: String(userId),
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const staffPermission = await this.prisma.staffPermission.findFirst({
      where: {
        userId: String(userId),
        permission: {
          name: permission,
        },
      },
    });

    if (!staffPermission) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }

    return true;
  }
}