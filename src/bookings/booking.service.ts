import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    const {
      phone,
      pickupLocation,
      dropoffLocation,
      pickupDateTime,
      fromCityId,
      toCityId,
      tripTypeId,
      vehicleTypeId,
      fare,
    } = dto;

    const user = await this.prisma.user.findFirst({ where: { phone } });
    if (!user) throw new NotFoundException('User not found');

    const pickupAddress = await this.prisma.addressBook.upsert({
      where: {
        userId_type_address: {
          userId: user.id,
          type: 'PICKUP',
          address: pickupLocation,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: 'PICKUP',
        address: pickupLocation,
      },
    });

    const dropAddress = await this.prisma.addressBook.upsert({
      where: {
        userId_type_address: {
          userId: user.id,
          type: 'DROP',
          address: dropoffLocation,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: 'DROP',
        address: dropoffLocation,
      },
    });

    return this.prisma.booking.create({
      data: {
        userId: user.id,
        vehicleTypeId,
        pickupAddressId: pickupAddress.id,
        dropAddressId: dropAddress.id,
        pickupDateTime: new Date(pickupDateTime),
        fromCityId,
        toCityId,
        tripTypeId,
        fare,
        status: 'PENDING',
      },
    });
  }

  findAll() {
    return this.prisma.booking.findMany({
      include: {
        user: true,
        vehicleType: true,
        pickupAddress: true,
        dropAddress: true,
        fromCity: true,
        toCity: true,
        TripType: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        vehicleType: true,
        pickupAddress: true,
        dropAddress: true,
        fromCity: true,
        toCity: true,
        TripType: true,
      },
    });
  }

  async update(id: number, data: UpdateBookingDto) {
    await this.findOne(id);
    return this.prisma.booking.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.booking.delete({ where: { id } });
  }
}
