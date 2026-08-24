import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { PricingService } from './pricing.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permission } from '../common/decorators/permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@Controller('pricing')
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
  ) {}

  @Get()
  getAllPricing() {
    return this.pricingService.getAllPricing();
  }

  @Get('developer/docs')
  developerDocs() {
    return this.pricingService.getDeveloperDocs();
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('MANAGE_PRICING')
  @Post()
  createPricing(
    @Body()
    body: {
      serviceName: string;
      price: number;
    },
  ) {
    return this.pricingService.createPricing(body);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('MANAGE_PRICING')
  @Patch(':id')
  updatePricing(
    @Param('id') id: string,
    @Body() body: { price: number },
  ) {
    return this.pricingService.updatePricing(
      id,
      body.price,
    );
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('MANAGE_PRICING')
  @Delete(':id')
  deletePricing(@Param('id') id: string) {
    return this.pricingService.deletePricing(id);
  }
}