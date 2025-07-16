import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  Patch,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../types/auth-request';

@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  create(@Body() dto: CreateDriverDto, @Req() req: AuthRequest) {
    return this.driverService.createDriverByRole(dto, req.user);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.driverService.findDriversByRole(req.user);
  }

  @Get('/available')
  getAvailableDrivers() {
    return this.driverService.getAvailableDrivers();
  }

  @Patch('/assign')
  assignDriverToVehicle(
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
