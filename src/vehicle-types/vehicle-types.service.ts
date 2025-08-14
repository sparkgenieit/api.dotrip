import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehicleTypesService {
  constructor(private readonly prisma: PrismaService) {}

  // LIST
  findAll() {
    return this.prisma.vehicleType.findMany({ orderBy: { id: 'desc' } });
  }

  // GET BY ID  -> used by Edit dialog
  async findOne(id: number) {
    const row = await this.prisma.vehicleType.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('VehicleType not found');
    return row;
  }

  // CREATE  -> used by Add dialog
  create(dto: any) {
    return this.prisma.vehicleType.create({
      data: {
        name: dto.name,
        estimatedRatePerKm:
          dto.estimatedRatePerKm !== undefined ? Number(dto.estimatedRatePerKm) : 0,
        baseFare: dto.baseFare !== undefined ? Number(dto.baseFare) : 0,
        seatingCapacity: dto.seatingCapacity !== undefined ? Number(dto.seatingCapacity) : 4,
        // image is JSON or JSON[]; only set if provided
        ...(dto.image !== undefined ? { image: dto.image } : {}),
      },
    });
  }

  // UPDATE  -> used by Edit dialog save
  async update(id: number, dto: any) {
    await this.ensureExists(id);
    return this.prisma.vehicleType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.estimatedRatePerKm !== undefined
          ? { estimatedRatePerKm: Number(dto.estimatedRatePerKm) }
          : {}),
        ...(dto.baseFare !== undefined ? { baseFare: Number(dto.baseFare) } : {}),
        ...(dto.seatingCapacity !== undefined
          ? { seatingCapacity: Number(dto.seatingCapacity) }
          : {}),
        ...(dto.image !== undefined ? { image: dto.image } : {}),
      },
    });
  }

  // DELETE  -> used by Delete button
  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.vehicleType.delete({ where: { id } });
    return { message: 'Deleted' };
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.vehicleType.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('VehicleType not found');
  }
}
