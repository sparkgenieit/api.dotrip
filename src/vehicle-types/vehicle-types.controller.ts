import { Controller, Get } from '@nestjs/common';
import { VehicleTypesService } from './vehicle-types.service';

@Controller('vehicle-types')
export class VehicleTypesController {
  constructor(private readonly vehicleTypesService: VehicleTypesService) {}

  @Get()
  findAll() {
    return this.vehicleTypesService.findAll();
  }
}
