import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req, ParseIntPipe, Res
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingPublicDto } from './dto/create-booking-public.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthRequest } from '../types/auth-request';
import { Response } from 'express';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // RIDER can create bookings
    @Post()
  @Roles('ADMIN','VENDOR','RIDER')
  async create(
    @Body() dto: CreateBookingPublicDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('📘 BookingController.create called with DTO:', dto, 'by user:', req.user);
    const created = await this.bookingService.create(dto, req.user);
    res.setHeader('Location', `/bookings/${created.id}`);
    return { id: created.id };
  }

  // Accessible by admins/vendors/drivers if needed
  @Get()
  @Roles('ADMIN', 'VENDOR', 'DRIVER')
  findAll(@Req() req: AuthRequest) {
    return this.bookingService.findAll(req.user);
  }

  // RIDER can get booking by id
  @Get(':id')
  @Roles('ADMIN','VENDOR','DRIVER','RIDER')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'VENDOR') // adjust if drivers should update too
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id);
  }

  @Get('assignable-vehicles/:vehicleTypeId')
  @Roles('ADMIN', 'VENDOR')
  getAssignableVehicles(
    @Param('vehicleTypeId') vehicleTypeId: string,
    @Req() req: AuthRequest
  ) {
    return this.bookingService.getAssignableVehicles(+vehicleTypeId, req.user);
  }

  @Patch(':id/confirm-if-assigned')
  @Roles('ADMIN', 'VENDOR')
  async confirmIfAssigned(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.markAsConfirmedIfTripsExist(id);
  }
}
