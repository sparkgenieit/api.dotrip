import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    userId: number;
    vehicleId: number;
    fromCityId: number;
    toCityId: number;
    pickupDateTime: string;
    tripTypeId: number;
    fare: number;
  }) {
    return this.prisma.booking.create({ data });
  }

  findAll() {
    return this.prisma.booking.findMany();
  }

  findOne(id: number) {
    return this.prisma.booking.findUnique({ where: { id } });
  }

  async update(id: number, data: any) {
    await this.findOneOrFail(id);
    return this.prisma.booking.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.booking.delete({ where: { id } });
  }

  private async findOneOrFail(id: number) {
    const b = await this.prisma.booking.findUnique({ where: { id } });
    if (!b) throw new NotFoundException(`Booking ${id} not found`);
    return b;
  }
}
