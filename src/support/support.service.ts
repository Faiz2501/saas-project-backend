import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createTicket(data: {
    userId: string;
    subject: string;
    message: string;
  }) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId: data.userId,
        subject: data.subject,
        message: data.message,
        status: 'OPEN',
      },
    });

    this.notificationsService.create(
      data.userId,
      'TICKET_RAISED',
      'Ticket Submitted',
      `Your ticket "${data.subject}" has been raised and sent to our team.`,
      { ticketId: ticket.id, subject: data.subject },
    );

    return ticket;
  }

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllTickets() {
    return this.prisma.supportTicket.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTicketById(ticketId: string) {
    const ticket =
      await this.prisma.supportTicket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    return ticket;
  }

  async updateStatus(
    ticketId: string,
    status: string,
  ) {
    const ticket =
      await this.prisma.supportTicket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    const updated = await this.prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        status,
      },
    });

    if (status === 'RESOLVED') {
      this.notificationsService.create(
        ticket.userId,
        'TICKET_RESOLVED',
        'Ticket Resolved',
        `Your ticket "${ticket.subject}" has been marked as resolved.`,
        { ticketId, subject: ticket.subject },
      );
    }

    return updated;
  }

  async replyToTicket(
    ticketId: string,
    reply: string,
    status = 'RESOLVED',
  ) {
    const ticket =
      await this.prisma.supportTicket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    const updated = await this.prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        reply,
        status,
      },
    });

    this.notificationsService.create(
      ticket.userId,
      'TICKET_REPLIED',
      'Ticket Responded',
      `A staff member has responded to your ticket "${ticket.subject}".`,
      { ticketId, subject: ticket.subject },
    );

    if (status === 'RESOLVED') {
      this.notificationsService.create(
        ticket.userId,
        'TICKET_RESOLVED',
        'Ticket Resolved',
        `Your ticket "${ticket.subject}" has been marked as resolved.`,
        { ticketId, subject: ticket.subject },
      );
    }

    return updated;
  }

  async deleteTicket(ticketId: string) {
    const ticket =
      await this.prisma.supportTicket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    return this.prisma.supportTicket.delete({
      where: {
        id: ticketId,
      },
    });
  }
}