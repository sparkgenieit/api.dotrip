import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { UpdateTripDto } from './dto/update-trip.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRequest } from '../types/auth-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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
  @Roles('ADMIN', 'VENDOR')
  findAll(@Req() req: AuthRequest) {
    const { role, vendorId } = req.user;
    if (role === 'VENDOR') return this.tripsService.findAllByVendor(vendorId);
    return this.tripsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripsService.update(+id, updateTripDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripsService.remove(+id);
  }
}
