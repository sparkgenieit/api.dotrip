import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriverUpdatesService {
  constructor(private readonly prisma: PrismaService) {}

  async createManyFromMock(
    tripId: number,
    driverId: number,
    updates: {
      latitude: number;
      longitude: number;
      statusMessage: string;
    }[],
  ) {
    const data = updates.map((update, index) => ({
      tripId,
      driverId,
      latitude: update.latitude,
      longitude: update.longitude,
      statusMessage: update.statusMessage,
      createdAt: new Date(Date.now() + index * 60 * 60 * 1000), // Simulate 1-hour gaps
    }));

    return this.prisma.driverUpdate.createMany({ data });
  }

  async findByTrip(tripId: number) {
    return this.prisma.driverUpdate.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
