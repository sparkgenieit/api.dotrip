
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCorporateBookingDto } from './dto/create-corporate-booking.dto';

@Injectable()
export class CorporateBookingsService {
  constructor(private readonly prisma: PrismaService) {}

async create(dto: CreateCorporateBookingDto) {
  const { vehicleTypeId, ...rest } = dto;

  return this.prisma.corporateBooking.create({
    data: {
      ...rest,
      vehicleType: {
        connect: { id: vehicleTypeId },
      },
    },
  });
}

  findAll() {
    return this.prisma.corporateBooking.findMany();
  }

  findOne(id: string) {
    return this.prisma.corporateBooking.findUnique({ where: { id: parseInt(id) } });
  }

async update(id: string, dto: CreateCorporateBookingDto) {
  const { vehicleTypeId, ...rest } = dto;

  return this.prisma.corporateBooking.update({
    where: { id: parseInt(id) },
    data: {
      ...rest,
      vehicleType: {
        connect: { id: vehicleTypeId },
      },
    },
  });
}


  async getTripsForCorporateBooking(id: number) {
    return this.prisma.trip.findMany({
      where: { corporateBookingId: id },
      include: {
        driver: true,
        vehicle: true,
        booking: true,
      },
    });
  }
}
