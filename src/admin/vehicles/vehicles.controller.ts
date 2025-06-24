import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('admin/vehicles')
@UseGuards(AuthGuard('jwt'))
export class VehiclesController {
  constructor(private readonly svc: VehiclesService,
  private readonly prisma: PrismaService) {}

  
  @Get('check-registration')
async checkRegistration(
  @Query('registrationNumber') reg: string,
  @Query('excludeId') excludeId?: string
) {
  const where: any = { registrationNumber: reg };
  if (excludeId) {
    where.id = { not: Number(excludeId) };
  }

  const existing = await this.prisma.vehicle.findFirst({
    where,
    select: { id: true },
  });

  return { exists: !!existing };
}
  @Get()
  findAll(@Query('vendorId') vendorId: string) {
   const filters: any = {};
  if (vendorId) filters.vendorId = parseInt(vendorId);
  const result = this.svc.findAll(filters);
    console.log(result);
    return result;
  }

@Get('vendor-vehicles')
async getVehicles(@Query('vendorId') vendorId: string) {
  const filters: any = {};
  if (vendorId) filters.vendorId = parseInt(vendorId);

  return this.svc.findAll( filters );
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(+id);
  }

  @Post()
  create(
    @Req() req: Request & { user: { role: 'ADMIN' | 'VENDOR' | 'DRIVER'; vendorId?: number; driverId?: number } },
    @Body() dto: CreateVehicleDto
  ) {
    const u = req.user;
    return this.svc.create(dto, u);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.svc.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(+id);
  }

  @Post('register')
  register(
    @Req() req: Request & { user: { role: 'ADMIN' | 'VENDOR' | 'DRIVER'; vendorId?: number; driverId?: number } },
    @Body() dto: CreateVehicleDto
  ) {
    const u = req.user;
    if (!['VENDOR', 'DRIVER', 'ADMIN'].includes(u.role)) {
      throw new ForbiddenException();
    }
    return this.svc.register(dto, u);
  }


}
