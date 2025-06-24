import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create({ vendorId, ...rest }: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        ...rest,
        vendor: { connect: { id: vendorId } },
      },
    });
  }

  findAll() {
    return this.prisma.vehicle.findMany();
  }

  async findOne(id: number) {
    const v = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  async update(id: number, { vendorId, ...rest }: UpdateVehicleDto) {
    const data: any = { ...rest };
    if (vendorId) data.vendor = { connect: { id: vendorId } };
    return this.prisma.vehicle.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.vehicle.delete({ where: { id } });
  }
}