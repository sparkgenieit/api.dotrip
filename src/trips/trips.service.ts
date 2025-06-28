
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

async create(dto: CreateTripDto) {
  return this.prisma.trip.create({
    data: {
      bookingId: dto.bookingId,
      riderId: dto.riderId,
      driverId: dto.driverId,
      vehicleId: dto.vehicleId,
      vendorId: dto.vendorId,
      startTime: new Date(dto.startTime),
      endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      status: dto.status || 'ONGOING',
      distance: dto.distance,
      fare: dto.fare,
      breakdownReported: dto.breakdownReported || false,
      breakdownNotes: dto.breakdownNotes,
      corporateBookingId: dto.corporateBookingId ?? null, // safe optional
    },
  });
}



  findAll() {
    return this.prisma.trip.findMany();
  }

  findOne(id: string) {
    return this.prisma.trip.findUnique({ where: { id: parseInt(id) } });
  }
}
