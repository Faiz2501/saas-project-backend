import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  @Get(':userId')
  getWallet(@Param('userId') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Get('summary/:userId')
  getWalletSummary(@Param('userId') userId: string) {
    return this.walletService.getWalletSummary(userId);
  }

  @Post('credit')
  creditWallet(
    @Body()
    body: {
      userId: string;
      amount: number;
      description?: string;
    },
  ) {
    return this.walletService.creditWallet(
      body.userId,
      body.amount,
      body.description,
    );
  }

  @Post('debit')
  debitWallet(
    @Body()
    body: {
      userId: string;
      amount: number;
      description?: string;
    },
  ) {
    return this.walletService.debitWallet(
      body.userId,
      body.amount,
      body.description,
    );
  }

  @Get('transactions/:userId')
  getTransactions(@Param('userId') userId: string) {
    return this.walletService.getTransactions(userId);
  }
}