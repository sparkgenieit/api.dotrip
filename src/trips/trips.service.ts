
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '..//prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTripDto) {
    return this.prisma.trip.create({ data });
  }
  
  async findAll() {
    return this.prisma.trip.findMany({
      include: {
        booking: true,
        rider: true,
        driver: true,
        vehicle: true,
        vendor: true,
        Feedback: true,
        assistances: true,
      }
    });
  }

async findAllByVendor(vendorId: number) {
  return this.prisma.trip.findMany({
    where: { vendorId },
    include: {
      booking: {
        include: {
          pickupAddress: true,
          dropAddress: true,
          user: true,
        },
      },
      rider: true,
      driver: true,
      vehicle: true,
      vendor: true,
      Feedback: true,
      assistances: true, // ✅ Include this line
    },
  });
}

  async findOne(id: number) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        booking: true,
        rider: true,
        driver: true,
        vehicle: true,
        vendor: true,
        Feedback: true,
      }
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  async update(id: number, data: UpdateTripDto) {
    return this.prisma.trip.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.trip.delete({ where: { id } });
  }

  async findAllByDriver(driverId: number) {
  return this.prisma.trip.findMany({
    where: { driverId },
    include: {
      booking: {
        include: {
          pickupAddress: true,
          dropAddress: true,
          user: true,
        },
      },
      rider: true,
      driver: true,
      vehicle: true,
      vendor: true,
      Feedback: true,
      assistances: true, // ✅ Include this line
    },
  });
}

async reportAssistance(dto: any) {
  return this.prisma.tripAssistance.create({ data: dto });
}

async getAllAssistance() {
  return this.prisma.tripAssistance.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async getTripAssistance(tripId: number) {
  return this.prisma.tripAssistance.findFirst({ where: { tripId } });
}

async replyToTripAssistance(id: number, reply: string) {
  return this.prisma.tripAssistance.update({
    where: { id },
    data: { reply },
  });
}

}
