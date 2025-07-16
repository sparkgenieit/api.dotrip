import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.feedback.findMany({
      include: {
        trip: {
          include: {
            booking: {
              include: {
                pickupAddress: true,
                dropAddress: true,
              },
            },
          },
        },
        rider: {
          select: {
            name: true,
            email: true,
          },
        },
        driver: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { feedbackTime: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.feedback.findUnique({
      where: { id: Number(id) },
      include: {
        trip: {
          include: {
            booking: {
              include: {
                pickupAddress: true,
                dropAddress: true,
              },
            },
          },
        },
        rider: {
          select: {
            name: true,
            email: true,
          },
        },
        driver: {
          select: {
            fullName: true,
          },
        },
      },
    });
  }

  async createFeedback(dto: FeedbackDto) {
    const exists = await this.prisma.feedback.findUnique({
      where: { tripId: dto.tripId },
    });

    if (exists) {
      throw new BadRequestException('Feedback already exists for this trip');
    }

    return this.prisma.feedback.create({
      data: {
        tripId: dto.tripId,
        riderId: dto.riderId,
        driverId: dto.driverId,
        driverRating: dto.driverRating,
        vehicleRating: dto.vehicleRating,
        serviceRating: dto.serviceRating,
        comment: dto.comment,
      },
    });
  }
}
