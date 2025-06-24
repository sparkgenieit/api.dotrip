import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('admin/vendor/vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'VENDOR')
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'VENDOR')
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'VENDOR')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'VENDOR')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'VENDOR')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }
}