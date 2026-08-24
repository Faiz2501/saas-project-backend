import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricingService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getAllPricing() {
    return this.prisma.pricing.findMany({
      orderBy: {
        serviceName: 'asc',
      },
    });
  }

  async createPricing(data: {
    serviceName: string;
    price: number;
  }) {
    const existing =
      await this.prisma.pricing.findUnique({
        where: {
          serviceName: data.serviceName,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Pricing already exists',
      );
    }

    return this.prisma.pricing.create({
      data: {
        serviceName: data.serviceName,
        price: data.price,
        isActive: true,
      },
    });
  }

  async updatePricing(
    id: string,
    price: number,
  ) {
    return this.prisma.pricing.update({
      where: {
        id,
      },
      data: {
        price,
      },
    });
  }

  async deletePricing(id: string) {
    const pricing =
      await this.prisma.pricing.findUnique({
        where: {
          id,
        },
      });

    if (!pricing) {
      throw new NotFoundException(
        'Pricing not found',
      );
    }

    return this.prisma.pricing.delete({
      where: {
        id,
      },
    });
  }

  async getDeveloperDocs() {
    const pricing =
      await this.prisma.pricing.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          serviceName: 'asc',
        },
      });

    return pricing.map((item) => ({
      serviceName: item.serviceName,
      price: item.price,
      method: 'POST',
      endpoint:
        this.getEndpointForService(
          item.serviceName,
        ),
      description:
        this.getDescriptionForService(
          item.serviceName,
        ),
      requiredHeaders: {
        'x-api-key': 'YOUR_API_KEY',
        'Content-Type': 'application/json',
      },
      sampleRequest:
        this.getSampleRequest(
          item.serviceName,
        ),
      sampleResponse: {
        success: true,
        statusCode: 1,
        message:
          'Verification Successfully Completed',
      },
      errorCodes: [
        {
          code: 401,
          message: 'Invalid API Key',
        },
        {
          code: 400,
          message: 'Invalid Request',
        },
        {
          code: 500,
          message: 'Internal Server Error',
        },
      ],
    }));
  }

  private getDescriptionForService(
    serviceName: string,
  ) {
    const descriptions: Record<string, string> =
      {
        AADHAAR_OTP: 'Generate Aadhaar OTP',
        DIGILOCKER:
          'Verify Aadhaar through DigiLocker',
        PAN_VERIFY: 'Verify PAN details',
        PAN_360:
          'Fetch PAN comprehensive profile',
        DRIVING_LICENSE:
          'Verify Driving License',
        VOTER_ID: 'Verify Voter ID',
        PASSPORT: 'Verify Passport',
        PENNY_DROP:
          'Bank Account Penny Drop Verification',
        PAN_TO_GSTIN:
          'Fetch GSTIN from PAN',
        CIN_LOOKUP: 'Company CIN Lookup',
        GST_VERIFY: 'GSTIN Verification',
        UDYAM: 'Verify Udyam Registration',
        PAN_TO_UDYAM:
          'Fetch Udyam from PAN',
        FACE_MATCH:
          'Face Match Verification',
        FACE_LIVENESS:
          'Face Liveness Detection',
        NAME_MATCH:
          'Name Match Verification',
        REVERSE_GEOCODE:
          'Coordinates to Address Lookup',
        VEHICLE_RC:
          'Vehicle RC Verification',
        EMPLOYMENT_360:
          'Employment Background Verification',
        NUMBER_LOOKUP:
          'Mobile Number Intelligence',
      };

    return descriptions[serviceName] || '';
  }

  private getSampleRequest(
    serviceName: string,
  ) {
    const requests: Record<string, any> = {
      AADHAAR_OTP: {
        aadhaarNumber: '123412341234',
      },
      DIGILOCKER: {
        aadhaarNumber: '123412341234',
      },
      PAN_VERIFY: {
        panNumber: 'ABCDE1234F',
      },
      PAN_360: {
        panNumber: 'ABCDE1234F',
      },
      DRIVING_LICENSE: {
        dlNumber: 'DL1420110012345',
        dob: '1994-05-27',
      },
      VOTER_ID: {
        voterId: 'ABC1234567',
      },
      PASSPORT: {
        fileNumber: 'A1234567',
        dob: '1990-01-01',
      },
      PENNY_DROP: {
        accountNumber: '1234567890',
        ifsc: 'SBIN0001234',
      },
      PAN_TO_GSTIN: {
        panNumber: 'ABCDE1234F',
      },
      CIN_LOOKUP: {
        cin: 'U12345WB2024PTC123456',
      },
      GST_VERIFY: {
        gstNumber: '22AAAAA0000A1Z5',
      },
      UDYAM: {
        udyamNumber: 'UDYAM-WB-00-0000001',
      },
      PAN_TO_UDYAM: {
        panNumber: 'ABCDE1234F',
      },
      FACE_MATCH: {
        image1: 'base64-image',
        image2: 'base64-image',
      },
      FACE_LIVENESS: {
        image: 'base64-image',
      },
      NAME_MATCH: {
        name1: 'John Doe',
        name2: 'Jon Doe',
      },
      REVERSE_GEOCODE: {
        latitude: '22.5726',
        longitude: '88.3639',
      },
      VEHICLE_RC: {
        vehicleNumber: 'WB06A1234',
      },
      EMPLOYMENT_360: {
        panNumber: 'ABCDE1234F',
      },
      NUMBER_LOOKUP: {
        mobile: '9876543210',
      },
    };

    return requests[serviceName] || {};
  }

  private getEndpointForService(
    serviceName: string,
  ) {
    const endpoints: Record<string, string> =
      {
        AADHAAR_OTP:
          '/verifications/aadhaar/send-otp',
        DIGILOCKER:
          '/verifications/digilocker',
        PAN_VERIFY:
          '/verifications/pan',
        PAN_360:
          '/verifications/pan-360',
        DRIVING_LICENSE:
          '/verifications/driving-license',
        VOTER_ID:
          '/verifications/voter-id',
        PASSPORT:
          '/verifications/passport',
        PENNY_DROP:
          '/verifications/penny-drop',
        PAN_TO_GSTIN:
          '/verifications/pan-to-gstin',
        CIN_LOOKUP:
          '/verifications/cin-lookup',
        GST_VERIFY:
          '/verifications/gst',
        UDYAM:
          '/verifications/udyam',
        PAN_TO_UDYAM:
          '/verifications/pan-to-udyam',
        FACE_MATCH:
          '/verifications/face-match',
        FACE_LIVENESS:
          '/verifications/face-liveness',
        NAME_MATCH:
          '/verifications/name-match',
        REVERSE_GEOCODE:
          '/verifications/reverse-geocode',
        VEHICLE_RC:
          '/verifications/vehicle-rc',
        EMPLOYMENT_360:
          '/verifications/employment-360',
        NUMBER_LOOKUP:
          '/verifications/number-lookup',
      };

    return endpoints[serviceName] || '/verifications';
  }
}