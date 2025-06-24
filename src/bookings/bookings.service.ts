// src/bookings/bookings.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBookingDto) {
    const data: Prisma.BookingUncheckedCreateInput = {
      userId: dto.userId,
      vehicleId: dto.vehicleId,
      fromCityId: dto.fromCityId,
      toCityId: dto.toCityId,
      pickupAddressId: dto.pickupAddressId,
      dropAddressId: dto.dropAddressId,
      pickupDateTime: new Date(dto.pickupDateTime),
      tripTypeId: dto.tripTypeId,
      fare: dto.fare,
    };
    return this.prisma.booking.create({ data });
  }

  findAll() {
    return this.prisma.booking.findMany({ orderBy: { id: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.booking.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateBookingDto) {
    const data: Prisma.BookingUncheckedUpdateInput = {
      userId: dto.userId,
      vehicleId: dto.vehicleId,
      fromCityId: dto.fromCityId,
      toCityId: dto.toCityId,
      pickupAddressId: dto.pickupAddressId,
      dropAddressId: dto.dropAddressId,
      pickupDateTime: dto.pickupDateTime ? new Date(dto.pickupDateTime) : undefined,
      tripTypeId: dto.tripTypeId,
      fare: dto.fare,
    };
    return this.prisma.booking.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.booking.delete({ where: { id } });
  }
}
