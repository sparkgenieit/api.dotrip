
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateCorporateBookingDto } from './dto/create-corporate-booking.dto';
import { CorporateBookingsService } from './corporate-bookings.service';
import { ParseIntPipe } from '@nestjs/common';

@Controller('corporate-bookings')
export class CorporateBookingsController {
  constructor(private readonly service: CorporateBookingsService) {}

  @Post()
  create(@Body() dto: CreateCorporateBookingDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateCorporateBookingDto) {
    return this.service.update(id, dto);
  }
  // src/corporate-bookings/corporate-bookings.controller.ts
 @Get(':id/trips')
  async getTrips(@Param('id', ParseIntPipe) id: number) {
    return this.service.getTripsForCorporateBooking(id);
  }
}
