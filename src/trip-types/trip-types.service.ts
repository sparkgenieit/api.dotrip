import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripTypesService {
  constructor(private prisma: PrismaService) {}
create(data: { label: string }) {
    const slug = data.label.trim().toLowerCase().replace(/\s+/g, '-');
    return this.prisma.tripType.create({
      data: {
        label: data.label,
        slug,
      },
    });
  }
  findAll() {
    return this.prisma.tripType.findMany();
  }

  findOne(id: number) {
    return this.prisma.tripType.findUnique({ where: { id } });
  }

 async update(id: number, data: { label?: string }) {
  await this.findOneOrFail(id);

  const updateData: any = { ...data };

  if (data.label) {
    updateData.slug = data.label.trim().toLowerCase().replace(/\s+/g, '-');
  }

  return this.prisma.tripType.update({
    where: { id },
    data: updateData,
  });
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
