// ✅ driver.controller.ts
import { Controller, Post, Body, Get, Param, Delete, Put, Patch, NotFoundException } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post('add')
  create(@Body() dto: CreateDriverDto) {
    return this.driverService.create(dto);
  }

  @Get()
  findAll() {
    return this.driverService.findAll();
  }
  @Get('/available')
  getAvailableDrivers() {
    return this.driverService.getAvailableDrivers();
  }

 

  @Patch('/assign')
  async assignDriverToVehicle(
    @Body('driverId') driverId: number,
    @Body('vehicleId') vehicleId: number,
  ) {
    if (!driverId || !vehicleId) {
      throw new NotFoundException('Driver ID and Vehicle ID required');
    }
    return this.driverService.assignDriverToVehicle(driverId, vehicleId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.driverService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driverService.remove(+id);
  }
}
