import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import Razorpay from 'razorpay';
import * as crypto from 'crypto';

import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class RazorpayService {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  private getRazorpay() {
    const keyId =
      process.env.RAZORPAY_KEY_ID;

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new BadRequestException(
        'Razorpay credentials not configured',
      );
    }

    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(
    userId: string,
    amount: number,
  ) {
    if (amount < 100) {
      throw new BadRequestException(
        'Minimum recharge amount is 100',
      );
    }

    const razorpay =
      this.getRazorpay();

    const order =
      await razorpay.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: `wallet_${Date.now()}`,
        notes: {
          userId,
        },
      });

    return order;
  }

  verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    const secret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new BadRequestException(
        'Razorpay credentials not configured',
      );
    }

    const body =
      razorpayOrderId +
      '|' +
      razorpayPaymentId;

    const expectedSignature =
      crypto
        .createHmac(
          'sha256',
          secret,
        )
        .update(body)
        .digest('hex');

    return (
      expectedSignature ===
      razorpaySignature
    );
  }

  async creditWalletAfterPayment(
    userId: string,
    amount: number,
  ) {
    return this.walletService.creditWallet(
      userId,
      amount,
      'Razorpay Recharge',
    );
  }
}