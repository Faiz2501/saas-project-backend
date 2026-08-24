import { IsString } from 'class-validator';

export class ResendRegistrationOtpDto {
  @IsString()
  registrationId: string;
}