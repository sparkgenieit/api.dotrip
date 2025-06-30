import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateBookingDto) {
    return this.prisma.booking.create({ data });
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
      }
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
      }
    });
  }

  async update(id: number, data: UpdateBookingDto) {
    await this.findOne(id); // Check existence
    return this.prisma.booking.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id); // Check existence
    return this.prisma.booking.delete({ where: { id } });
  }
}