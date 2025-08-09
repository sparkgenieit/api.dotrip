import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingPublicDto } from './dto/create-booking-public.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../types/auth-request';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

 @Post()
create(@Body() body: CreateBookingPublicDto) {
  return this.bookingService.create(body);
}

@Get()
findAll(@Req() req: AuthRequest) {
  // req.user should have { id, role } from JwtAuthGuard
  return this.bookingService.findAll(req.user);
}


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(+id, updateBookingDto);
  }

    @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id);
  }

  @Get('assignable-vehicles/:vehicleTypeId')
  getAssignableVehicles(
  @Param('vehicleTypeId') vehicleTypeId: string,
  @Req() req: AuthRequest
) {
  return this.bookingService.getAssignableVehicles(+vehicleTypeId, req.user);
}

  @Patch(':id/confirm-if-assigned')
  async confirmIfAssigned(@Param('id', ParseIntPipe) id: number) {
  return this.bookingService.markAsConfirmedIfTripsExist(id);
}

}