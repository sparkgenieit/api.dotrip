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
    const imageValue = this.coerceImage(dto?.image);

    return this.prisma.vehicleType.create({
      data: {
        name: dto.name,
        estimatedRatePerKm:
          dto.estimatedRatePerKm !== undefined ? Number(dto.estimatedRatePerKm) : 0,
        baseFare: dto.baseFare !== undefined ? Number(dto.baseFare) : 0,
        seatingCapacity:
          dto.seatingCapacity !== undefined ? Number(dto.seatingCapacity) : 4,
        // image is a String column now
        ...(typeof imageValue !== 'undefined' ? { image: imageValue } : {}),
      },
    });
  }

  // UPDATE  -> used by Edit dialog save
  async update(id: number, dto: any) {
    await this.ensureExists(id);

    const imageValue = this.coerceImage(dto?.image);
    const { image, ...rest } = dto ?? {};

    return this.prisma.vehicleType.update({
      where: { id },
      data: {
        ...(rest.name !== undefined ? { name: rest.name } : {}),
        ...(rest.estimatedRatePerKm !== undefined
          ? { estimatedRatePerKm: Number(rest.estimatedRatePerKm) }
          : {}),
        ...(rest.baseFare !== undefined ? { baseFare: Number(rest.baseFare) } : {}),
        ...(rest.seatingCapacity !== undefined
          ? { seatingCapacity: Number(rest.seatingCapacity) }
          : {}),
        // image must be a plain string (or omit)
        ...(typeof imageValue !== 'undefined' ? { image: imageValue } : {}),
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

  // 🔧 Normalizes dto.image to a single string (or undefined)
  private coerceImage(input: any): string | undefined {
    if (input == null) return undefined;
    if (typeof input === 'string') return input;
    if (Array.isArray(input)) {
      const first = input.find((v) => typeof v === 'string');
      return first ?? undefined;
    }
    if (typeof input === 'object' && typeof input.url === 'string') {
      return input.url;
    }
    return undefined;
  }
}
