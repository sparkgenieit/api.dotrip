import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; state: string }) {
    return this.prisma.city.create({ data });
  }

  findAll() {
    return this.prisma.city.findMany();
  }

  findOne(id: number) {
    return this.prisma.city.findUnique({ where: { id } });
  }

  async update(id: number, data: { name?: string; state?: string }) {
    await this.findOneOrFail(id);
    return this.prisma.city.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.city.delete({ where: { id } });
  }

  private async findOneOrFail(id: number) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException(`City with id ${id} not found`);
    return city;
  }
}
