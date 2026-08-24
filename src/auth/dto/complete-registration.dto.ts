import { IsString, MinLength } from 'class-validator';

export class CompleteRegistrationDto {
  @IsString()
  registrationId: string;

  @IsString()
  @MinLength(4)
  emailOtp: string;
}