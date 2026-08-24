import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { SupportService } from './support.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permission } from '../common/decorators/permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@Controller(['support', 'admin/support'])
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
  ) {}

  @Post('create')
  createTicket(
    @Body()
    body: {
      userId: string;
      subject: string;
      message: string;
    },
  ) {
    return this.supportService.createTicket(body);
  }

  @Get('user/:userId')
  getUserTickets(@Param('userId') userId: string) {
    return this.supportService.getUserTickets(userId);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('VIEW_SUPPORT')
  @Get('all')
  getAllTickets() {
    return this.supportService.getAllTickets();
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('VIEW_SUPPORT')
  @Get(':ticketId')
  getTicket(@Param('ticketId') ticketId: string) {
    return this.supportService.getTicketById(ticketId);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('VIEW_SUPPORT')
  @Patch(':ticketId/status')
  updateStatus(
    @Param('ticketId') ticketId: string,
    @Body()
    body: {
      status: string;
    },
  ) {
    return this.supportService.updateStatus(
      ticketId,
      body.status,
    );
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('VIEW_SUPPORT')
  @Patch(':ticketId/reply')
  replyTicket(
    @Param('ticketId') ticketId: string,
    @Body()
    body: {
      reply: string;
      status?: string;
    },
  ) {
    return this.supportService.replyToTicket(
      ticketId,
      body.reply,
      body.status || 'RESOLVED',
    );
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('VIEW_SUPPORT')
  @Delete(':ticketId')
  deleteTicket(@Param('ticketId') ticketId: string) {
    return this.supportService.deleteTicket(ticketId);
  }
}