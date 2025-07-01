import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCorporateBookingDto } from './dto/create-corporate-booking.dto';
import { UpdateCorporateBookingDto } from './dto/update-corporate-booking.dto';

@Injectable()
export class CorporateBookingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCorporateBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const { bookingId, ...rest } = dto;

    return this.prisma.corporateBooking.create({
      data: {
        ...rest,
        booking: { connect: { id: bookingId } },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.corporateBooking.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateCorporateBookingDto) {
    return this.prisma.corporateBooking.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.corporateBooking.delete({ where: { id } });
  }
}
