import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  Param,
} from '@nestjs/common';

import { VerificationsService } from './verifications.service';

@Controller('verifications')
export class VerificationsController {
  constructor(
    private readonly verificationsService: VerificationsService,
  ) {}

  // =========================
  // EXISTING SERVICES
  // =========================

  @Post('pan')
  pan(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'PAN_VERIFY',
      '/service/pancard/verify',
      body,
    );
  }

  @Post('gst')
  gst(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'GST_VERIFY',
      '/service/gstin/verify',
      body,
    );
  }

  @Post('aadhaar/send-otp')
  aadhaarOtp(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'AADHAAR_OTP',
      '/service/aadhaar/otp/generate',
      body,
    );
  }

  @Post('passport')
  passport(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'PASSPORT',
      '/service/docs/passport/verify',
      body,
    );
  }

  @Post('digilocker')
  digilocker(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'DIGILOCKER',
      '/service/digilocker/verify',
      body,
    );
  }

  @Post('driving-license')
  drivingLicense(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'DRIVING_LICENSE',
      '/service/dl/verify',
      body,
    );
  }

  @Post('voter-id')
  voterId(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'VOTER_ID',
      '/service/docs/voter-id/verify',
      body,
    );
  }

  // =========================
  // NEW SERVICES
  // =========================

  @Post('pan-360')
  pan360(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'PAN_360',
      '/service/pan/360',
      body,
    );
  }

  @Post('penny-drop')
  pennyDrop(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'PENNY_DROP',
      '/service/bank/verification',
      body,
    );
  }

  @Post('pan-to-gstin')
  panToGstin(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'PAN_TO_GSTIN',
      '/service/get/pan-gstin',
      body,
    );
  }

  @Post('cin-lookup')
  cinLookup(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'CIN_LOOKUP',
      '/service/get/cin',
      body,
    );
  }

  @Post('udyam')
  udyam(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'UDYAM',
      '/service/udyam/verify',
      body,
    );
  }

  @Post('pan-to-udyam')
  panToUdyam(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'PAN_TO_UDYAM',
      '/service/get/pan-udyam',
      body,
    );
  }

  @Post('face-match')
  faceMatch(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'FACE_MATCH',
      '/service/face/match',
      body,
    );
  }

  @Post('face-liveness')
  faceLiveness(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'FACE_LIVENESS',
      '/service/face/liveness',
      body,
    );
  }

  @Post('name-match')
  nameMatch(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'NAME_MATCH',
      '/service/name/match',
      body,
    );
  }

  @Post('reverse-geocode')
  reverseGeocode(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'REVERSE_GEOCODE',
      '/service/reverse-geocode',
      body,
    );
  }

  @Post('vehicle-rc')
  vehicleRc(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'VEHICLE_RC',
      '/service/docs/vehicle-rc/verify',
      body,
    );
  }

  @Post('employment-360')
  employment360(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'EMPLOYMENT_360',
      '/advanceEmploymentVerify',
      body,
    );
  }

  @Post('number-lookup')
  numberLookup(
    @Headers('x-api-key') apiKey: string,
    @Body() body: any,
  ) {
    return this.verificationsService.executeVerification(
      apiKey,
      'NUMBER_LOOKUP',
      '/service/telecome/number-lookup',
      body,
    );
  }

  // =========================
  // HISTORY
  // =========================

  @Get('history/:userId')
  history(
    @Param('userId') userId: string,
  ) {
    return this.verificationsService.getHistory(
      userId,
    );
  }
}