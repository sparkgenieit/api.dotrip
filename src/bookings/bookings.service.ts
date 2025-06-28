
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        userId: dto.userId,
        vehicleTypeId: dto.vehicleTypeId,
        pickupAddressId: dto.pickupAddressId,
        dropAddressId: dto.dropAddressId,
        fromCityId: dto.fromCityId,
        toCityId: dto.toCityId,
        pickupDateTime: new Date(dto.pickupDateTime),
        tripTypeId: dto.tripTypeId,
        fare: dto.fare,
        status: dto.status
      }
    });
  }

  findAll() {
    return this.prisma.booking.findMany();
  }

  findOne(id: string) {
    return this.prisma.booking.findUnique({ where: { id: parseInt(id) } });
  }

  update(id: string, dto: CreateBookingDto) {
    return this.prisma.booking.update({
      where: { id: parseInt(id) },
      data: dto,
    });
  }
}
