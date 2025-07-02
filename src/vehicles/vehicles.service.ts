import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { vendorId?: number }) {
    return this.prisma.vehicle.findMany({
      where: filters.vendorId ? { vendorId: filters.vendorId } : undefined,
      include: {
        vendor: true,
        driver: true,
      },
    });
  }

  async findOne(id: number) {
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id },
    include: {
      vendor: true,
      driver: true,
      vehicleType: true, // ✅ Include vehicleType for prefill
    },
  });
  if (!vehicle) throw new NotFoundException(`Vehicle #${id} not found`);
  return vehicle;
}


  async create(
    dto: CreateVehicleDto,
    current: { userId?: number; role: string; vendorId?: number }
  ) {
    const data: any = {
      name: dto.name,
      model: dto.model,
      image: dto.image,
      capacity: dto.capacity,
      price: dto.price,
      originalPrice: dto.originalPrice,
      registrationNumber: dto.registrationNumber,
      vehicleTypeId: dto.vehicleTypeId,
      status: dto.status ?? 'available',
      comfortLevel: dto.comfortLevel ?? 3,
      lastServicedDate: dto.lastServicedDate
        ? new Date(dto.lastServicedDate)
        : undefined,
    };

      // ✅ Set scalar vendorId instead of relational connect
  if (current.role === 'VENDOR' && current.userId) {
    data.vendorId = current.userId;
  } else if (dto.vendorId) {
    data.vendorId = dto.vendorId;
  }

    return this.prisma.vehicle.create({ data });
  }

  async update(id: number, dto: UpdateVehicleDto) {
    const { vendorId, lastServicedDate, ...rest } = dto;

    const data: any = {
      ...rest,
      ...(lastServicedDate && {
        lastServicedDate: new Date(lastServicedDate),
      }),
    };

   // ✅ Set scalar vendorId directly
  if (vendorId !== undefined) {
    data.vendorId = vendorId || null; // null will disconnect
  }

    return this.prisma.vehicle.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.vehicle.delete({ where: { id } });
  }

  async register(
    dto: CreateVehicleDto,
    current: { role: string; vendorId?: number }
  ) {
    return this.create(dto, current);
  }
}
