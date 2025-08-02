
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '..//prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTripDto) {
    return this.prisma.trip.create({ data });
  }

  async update(id: number, data: UpdateTripDto) {
  return this.prisma.trip.update({
    where: { id },
    data,
  });
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

// 🔁 Replace this block in your TripsService
async replyToTripAssistance(tripId: number, reply: string) {
  const existing = await this.prisma.tripAssistance.findFirst({
    where: { tripId }, // ✅ find by tripId instead of id
  });

  if (!existing) {
    throw new NotFoundException('Trip assistance request not found');
  }

  return this.prisma.tripAssistance.update({
    where: { id: existing.id },
    data: {
      reply,
      messageStatus: 'READ',
    },
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

// trips.service.ts

async assignVehicleToTrip(tripId: number, vehicleId: number): Promise<Trip> {
  return this.prisma.trip.update({
    where: { id: tripId },
    data: {
      vehicle: {
        connect: { id: vehicleId }
      }
    },
    include: {
      vehicle: true,
      driver: true,
    },
  });
}

async reassignVehicle(tripId: number, vehicleId: number, vendorUserId: number) {
  const trip = await this.prisma.trip.findUnique({
    where: { id: tripId },
    include: { vendor: true },
  });

  if (!trip) {
    throw new NotFoundException('Trip not found');
  }

  // Fetch the vehicle and validate ownership
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { vendor: true },
  });

  if (!vehicle || vehicle.vendor.userId !== vendorUserId) {
    throw new NotFoundException('You can only assign vehicles owned by your vendor account');
  }

  // Update the trip with the new vehicle
  return this.prisma.trip.update({
    where: { id: tripId },
    data: { vehicleId: vehicleId },
  });
}

}
