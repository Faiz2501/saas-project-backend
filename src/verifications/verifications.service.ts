import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { ApiKeysService } from '../api-keys/api-keys.service';

import { firstValueFrom } from 'rxjs';

function getProviderErrorMessage(error: any): string {
  const rawMessage =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.response?.data?.detail ??
    error?.message ??
    'Verification failed.';

  if (Array.isArray(rawMessage)) {
    return rawMessage.join(', ');
  }

  if (typeof rawMessage === 'object' && rawMessage !== null) {
    return JSON.stringify(rawMessage);
  }

  return String(rawMessage);
}

@Injectable()
export class VerificationsService {
  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  async executeVerification(
    apiKey: string,
    serviceName: string,
    endpoint: string,
    payload: any,
  ) {
    const key = await this.apiKeysService.validateApiKey(apiKey);

    if (!key) {
      throw new UnauthorizedException('Invalid API Key');
    }

    console.log('SERVICE:', serviceName);
    console.log('ENDPOINT:', endpoint);

    const pricing = await this.prisma.pricing.findUnique({
      where: {
        serviceName,
      },
    });

    console.log('PRICING:', pricing);

    if (!pricing) {
      throw new BadRequestException('Pricing not configured');
    }

    const wallet = await this.prisma.wallet.findFirst({
      where: {
        userId: key.userId,
      },
      select: {
        balance: true,
      },
    });

    const walletBalance = Number(wallet?.balance ?? 0);
    const servicePrice = Number(pricing.price);

    if (walletBalance < servicePrice) {
      throw new BadRequestException(
        'Insufficient balance. Please recharge your wallet.',
      );
    }

    try {
      console.log(
        'NEROTIX URL:',
        `${process.env.NEROTIX_BASE_URL}${endpoint}`,
      );

      console.log('PAYLOAD:', payload);

      const response = await firstValueFrom(
        this.http.post(
          `${process.env.NEROTIX_BASE_URL}${endpoint}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEROTIX_TOKEN}`,
            },
          },
        ),
      );

      console.log('NEROTIX SUCCESS:', response.data);

      await this.walletService.debitWallet(
        key.userId,
        servicePrice,
        `${serviceName} Verification`,
      );

      await this.prisma.verificationRequest.create({
        data: {
          userId: key.userId,
          serviceName,
          amount: servicePrice,
          status: 'SUCCESS',
          requestData: payload,
          responseData: response.data,
        },
      });

      return response.data;
    } catch (error: any) {
      console.log('========== NEROTIX ERROR ==========');
      console.log('SERVICE:', serviceName);
      console.log('ENDPOINT:', endpoint);
      console.log('STATUS:', error?.response?.status);
      console.log('RESPONSE:', error?.response?.data);
      console.log('MESSAGE:', error?.message);
      console.log('===================================');

      const providerMessage = getProviderErrorMessage(error);

      await this.prisma.verificationRequest.create({
        data: {
          userId: key.userId,
          serviceName,
          amount: servicePrice,
          status: 'FAILED',
          requestData: payload,
          responseData: error?.response?.data || {},
          errorMessage: providerMessage,
        },
      });

      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        throw new UnauthorizedException(providerMessage);
      }

      if (status && status >= 400 && status < 500) {
        throw new BadRequestException(providerMessage);
      }

      throw error;
    }
  }

  async getHistory(userId: string) {
    return this.prisma.verificationRequest.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}