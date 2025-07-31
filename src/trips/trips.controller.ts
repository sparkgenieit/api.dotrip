
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  NotFoundException, // 🆕 ADDED
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { UpdateTripDto } from './dto/update-trip.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRequest } from '../types/auth-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TripAssistanceDto } from './dto/trip-assistance.dto';
import { ParseIntPipe } from '@nestjs/common';
import { TripAssistanceReplyDto } from './dto/trip-assistance-reply.dto';

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @Roles('VENDOR')
  async create(
    @Body() body: { bookingId: number; vehicleIds: number[] },
    @Req() req: AuthRequest
  ) {
    const { bookingId, vehicleIds } = body;

    const { vendorId } = req.user;
    if (!vendorId) throw new UnauthorizedException('Vendor login required');

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { CorporateBooking: true },
    });
    if (!booking) throw new BadRequestException('Booking not found');

    const createdTrips = [];

    for (const vehicleId of vehicleIds) {
      const driver = await this.prisma.driver.findFirst({
        where: { assignedVehicleId: vehicleId },
      });

      if (!driver) {
        throw new BadRequestException(`No driver assigned to vehicle ${vehicleId}`);
      }

      const trip = await this.tripsService.create({
        bookingId,
        riderId: booking.userId,
        driverId: driver.id,
        vehicleId,
        vendorId,
        corporateBookingId: booking.CorporateBooking?.id,
        startTime: new Date(),
        status: 'ONGOING',
      });

      createdTrips.push(trip);
    }

    return createdTrips;
  }

  @Get()
@Roles('ADMIN', 'VENDOR', 'DRIVER') // ✅ Added DRIVER role
findAll(@Req() req: AuthRequest) {
  const { role, vendorId, driverId } = req.user;

  if (role === 'VENDOR') {
    return this.tripsService.findAllByVendor(vendorId);
  }

  if (role === 'DRIVER') {
    return this.tripsService.findAllByDriver(driverId); // ✅ Must implement this
  }

  return this.tripsService.findAll(); // Admin fallback
}


  @Put(':id')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripsService.update(+id, updateTripDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripsService.remove(+id);
  }

  // 🚨 Submit new assistance (Driver)
@Post('assistance')
@Roles('DRIVER')
async reportAssistance(@Body() dto: TripAssistanceDto) {
  return this.tripsService.reportAssistance(dto);
}


  // ✅ New endpoint: Get all assistance requests
  @Get('assistance/all')
  @Roles('VENDOR', 'ADMIN')
  async getAllAssistanceRequests() {
    return this.tripsService.getAllAssistance();
  }

  // 🔍 Get assistance for one trip
@Get(':id/assistance')
@Roles('DRIVER', 'VENDOR', 'ADMIN')
async getTripAssistance(@Param('id', ParseIntPipe) tripId: number, @Req() req: AuthRequest) {
  return this.tripsService.getTripAssistance(tripId);
}

  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(+id);
  }

  // ✅ New endpoint: Reply to a trip assistance
@Patch(':id/assistance/reply')
@UseGuards(JwtAuthGuard)
async sendTripAssistanceReply(
  @Param('id', ParseIntPipe) id: number,
  @Body('reply') reply: string,
  @Req() req: AuthRequest, // ✅ Use type-safe user-aware request
) {
  if (!reply || reply.trim().length === 0) {
    throw new BadRequestException('Reply cannot be empty');
  }
  return this.tripsService.replyToTripAssistance(id, reply);
}
}
