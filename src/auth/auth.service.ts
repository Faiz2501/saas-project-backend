import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { StartRegistrationDto } from './dto/start-registration.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { ResendRegistrationOtpDto } from './dto/resend-registration-otp.dto';

function generateOtp(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private getMailer() {
    const port = Number(process.env.SMTP_PORT || 587);

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async sendEmailOtp(
    email: string,
    firstName: string,
    otp: string,
  ) {
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {
      throw new BadRequestException(
        'Email OTP service is not configured',
      );
    }

    const transporter = this.getMailer();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your IDProofPro verification code',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2 style="margin-bottom: 16px;">Hello ${firstName},</h2>
          <p>Your email verification OTP is:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 20px 0; color: #2563eb;">${otp}</div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
  }

  async startRegistration(dto: StartRegistrationDto) {
    const email = normalizeEmail(dto.email);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    await this.prisma.signupOtp.deleteMany({
      where: { email },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const emailOtp = generateOtp(6);
    const emailOtpHash = await bcrypt.hash(emailOtp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const pending = await this.prisma.signupOtp.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email,
        passwordHash,
        emailOtpHash,
        expiresAt,
      },
    });

    try {
      await this.sendEmailOtp(email, dto.firstName.trim(), emailOtp);
    } catch (error: any) {
      await this.prisma.signupOtp.delete({
        where: { id: pending.id },
      }).catch(() => null);

      throw new BadRequestException(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to send OTP',
      );
    }

    return {
      registrationId: pending.id,
      message: 'OTP sent to email',
      email: maskEmail(email),
    };
  }

  async resendRegistrationOtp(dto: ResendRegistrationOtpDto) {
    const pending = await this.prisma.signupOtp.findUnique({
      where: { id: dto.registrationId },
    });

    if (!pending) {
      throw new BadRequestException(
        'OTP session not found. Please start registration again.',
      );
    }

    if (pending.expiresAt.getTime() < Date.now()) {
      await this.prisma.signupOtp.delete({
        where: { id: pending.id },
      }).catch(() => null);

      throw new BadRequestException(
        'OTP session expired. Please start registration again.',
      );
    }

    const emailOtp = generateOtp(6);
    const emailOtpHash = await bcrypt.hash(emailOtp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await this.sendEmailOtp(pending.email, pending.firstName, emailOtp);
    } catch (error: any) {
      throw new BadRequestException(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to resend OTP',
      );
    }

    await this.prisma.signupOtp.update({
      where: { id: pending.id },
      data: {
        emailOtpHash,
        expiresAt,
      },
    });

    return {
      message: 'OTP resent successfully',
    };
  }

  async register(dto: CompleteRegistrationDto) {
    const pending = await this.prisma.signupOtp.findUnique({
      where: { id: dto.registrationId },
    });

    if (!pending) {
      throw new BadRequestException(
        'OTP session not found. Please start registration again.',
      );
    }

    if (pending.expiresAt.getTime() < Date.now()) {
      await this.prisma.signupOtp.delete({
        where: { id: pending.id },
      }).catch(() => null);

      throw new BadRequestException(
        'OTP expired. Please send OTP again.',
      );
    }

    const emailOk = await bcrypt.compare(
      dto.emailOtp.trim(),
      pending.emailOtpHash,
    );

    if (!emailOk) {
      throw new BadRequestException('Invalid OTP');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: pending.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email: pending.email,
        password: pending.passwordHash,
        firstName: pending.firstName,
        lastName: pending.lastName,
      },
    });

    await this.prisma.signupOtp.delete({
      where: { id: pending.id },
    }).catch(() => null);

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: refresh_token,
      },
    });

    return {
      access_token,
      refresh_token,
      role: user.role,
      userId: user.id,
      email: user.email,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const access_token = await this.jwtService.signAsync(newPayload, {
        expiresIn: '15m',
      });

      return { access_token };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}