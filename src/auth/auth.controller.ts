import {
  Body,
  Controller,
  Post,
  Get,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { StartRegistrationDto } from './dto/start-registration.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { ResendRegistrationOtpDto } from './dto/resend-registration-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Get('test')
  test() {
    return {
      message: 'AUTH WORKING',
    };
  }

  @Post('register/start')
  sendRegistrationOtp(
    @Body() dto: StartRegistrationDto,
  ) {
    return this.authService.startRegistration(dto);
  }

  @Post('register/resend')
  resendRegistrationOtp(
    @Body() dto: ResendRegistrationOtpDto,
  ) {
    return this.authService.resendRegistrationOtp(dto);
  }

  @Post('register')
  register(
    @Body() dto: CompleteRegistrationDto,
  ) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(
    @Body()
    body: {
      refresh_token: string;
    },
  ) {
    return this.authService.refreshToken(
      body.refresh_token,
    );
  }
}