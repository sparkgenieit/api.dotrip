import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}
  @Post() create(@Body() dto: CreateVehicleDto) { return this.vehiclesService.create(dto); }
  @Get() findAll() { return this.vehiclesService.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.vehiclesService.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehicleDto) { return this.vehiclesService.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.vehiclesService.remove(id); }
}
