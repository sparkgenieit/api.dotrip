import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { vendorId?: number }) {
  return this.prisma.vehicle.findMany({
    where: {
      ...(filters.vendorId && {
        vendor: {
          id: filters.vendorId,
          role: 'VENDOR',
        },
      }),
    },
    include: {
      vendor: true,
      driver: true,
    },
  });
}


  async findOne(id: number) {
    const v = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!v) throw new NotFoundException(`Vehicle #${id} not found`);
    return v;
  }

  async create(
    dto: CreateVehicleDto,
    current: { userId?:number, role: string; vendorId?: number; driverId?: number },
  ) {
    const data: any = {
      name: dto.name,
      model: dto.model,
      image: dto.image,
      capacity: dto.capacity,
      price: dto.price,
      originalPrice: dto.originalPrice,
      registrationNumber: dto.registrationNumber,
    };
console.log(current);
    if (current.role === 'VENDOR') {
      data.vendor = { connect: { id: current.userId } };
    } 
console.log(data);
    /*if (current.role === 'DRIVER') {
      data.driver = { connect: { id: current.driverId } };
    } else if (dto.driverId !== undefined) {
      data.driver = { connect: { id: dto.driverId } };
    }
    // Do not set driver connection during vehicle creation at all
    // Since driverId will always be null
    */
    return this.prisma.vehicle.create({ data });
  }

  async update(id: number, dto: UpdateVehicleDto) {
    const {
      vendorId,
      driverId,
      ...rest
    } = dto;

    const data: any = { ...rest }; console.log('data',id,data);
/*
    if (vendorId !== undefined) {
      data.vendor = vendorId ? { connect: { id: vendorId } } : { disconnect: true };
    }

    if (driverId !== undefined) {
      data.driver = driverId ? { connect: { id: driverId } } : { disconnect: true };
    }
      */

    return this.prisma.vehicle.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.vehicle.delete({ where: { id } });
  }

  async register(
    dto: CreateVehicleDto,
    current: { role: string; vendorId?: number; driverId?: number },
  ) {
    return this.create(dto, current);
  }
}
