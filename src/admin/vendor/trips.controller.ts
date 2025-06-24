import { Controller, Get, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('admin/vendor/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'VENDOR')
  findAll() {
    return this.tripsService.findAll();
  }
}