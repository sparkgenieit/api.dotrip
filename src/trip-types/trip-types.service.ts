import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripTypesService {
  constructor(private prisma: PrismaService) {}

  create(data: { label: string }) {
    return this.prisma.tripType.create({ data });
  }

  findAll() {
    return this.prisma.tripType.findMany();
  }

  findOne(id: number) {
    return this.prisma.tripType.findUnique({ where: { id } });
  }

  async update(id: number, data: { label?: string }) {
    await this.findOneOrFail(id);
    return this.prisma.tripType.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.tripType.delete({ where: { id } });
  }

  private async findOneOrFail(id: number) {
    const tt = await this.prisma.tripType.findUnique({ where: { id } });
    if (!tt) throw new NotFoundException(`TripType ${id} not found`);
    return tt;
  }
}
