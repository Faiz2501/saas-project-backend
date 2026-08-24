import { Module } from '@nestjs/common';

import { RazorpayController } from './razorpay.controller';
import { RazorpayService } from './razorpay.service';

import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [RazorpayController],
  providers: [RazorpayService],
})
export class RazorpayModule {}