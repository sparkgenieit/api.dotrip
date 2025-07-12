
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripsService } from './trips.service';

@Controller('/admin/trips')
export class TripsController {
  constructor(private readonly service: TripsService) {}

  @Post()
  create(@Body() dto: CreateTripDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
