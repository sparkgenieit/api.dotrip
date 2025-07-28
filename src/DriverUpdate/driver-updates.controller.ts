import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { DriverUpdatesService } from './driver-updates.service';

@Controller('driver-updates')
export class DriverUpdatesController {
  constructor(private readonly driverUpdatesService: DriverUpdatesService) {}

  @Post('mock')
  async createMockUpdates(
    @Body()
    body: {
      tripId: number;
      driverId: number;
      updates: {
        latitude: number;
        longitude: number;
        statusMessage: string;
      }[];
    },
  ) {
    const { tripId, driverId, updates } = body;

    if (!tripId || !driverId || !updates || !Array.isArray(updates)) {
      throw new BadRequestException(
        'tripId, driverId, and updates array are required.',
      );
    }

    return this.driverUpdatesService.createManyFromMock(
      tripId,
      driverId,
      updates,
    );
  }

  @Get(':tripId')
  async getUpdatesByTrip(@Param('tripId') tripId: string) {
    const parsedId = parseInt(tripId, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid tripId.');
    }
    return this.driverUpdatesService.findByTrip(parsedId);
  }
}
