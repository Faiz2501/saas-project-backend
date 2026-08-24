import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  /** GET /notifications — all notifications for the logged-in user */
  @Get()
  findAll(@Request() req: any) {
    return this.notificationsService.findAll(req.user.sub);
  }

  /** GET /notifications/unread — unread only */
  @Get('unread')
  findUnread(@Request() req: any) {
    return this.notificationsService.findUnread(req.user.sub);
  }

  /** GET /notifications/unread/count — badge counter */
  @Get('unread/count')
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.sub);
  }

  /** PATCH /notifications/read-all — mark all as read */
  @Patch('read-all')
  markAllRead(@Request() req: any) {
    return this.notificationsService.markAllRead(req.user.sub);
  }

  /** PATCH /notifications/:id/read — mark single as read */
  @Patch(':id/read')
  markOneRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markOneRead(id, req.user.sub);
  }

  /** DELETE /notifications — clear all notifications */
  @Delete()
  deleteAll(@Request() req: any) {
    return this.notificationsService.deleteAll(req.user.sub);
  }

  /** DELETE /notifications/:id — delete single notification */
  @Delete(':id')
  deleteOne(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.deleteOne(id, req.user.sub);
  }
}
