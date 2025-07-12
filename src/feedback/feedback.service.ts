import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    where: { id: Number(id) }, // 'id' is Int in your schema
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

}
