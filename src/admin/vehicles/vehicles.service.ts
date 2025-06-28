import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { vendorId?: number }) {
    return this.prisma.vehicle.findMany({
      where: filters.vendorId ? { vendorId: filters.vendorId } : undefined,
      include: {
        vendor: true, // ✅ this is valid if `vendor` is defined in `Vehicle` model
        driver: true,
      },
    });
  }

  async findOne(id: number) {
    const v = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { vendor: true, driver: true }, // optional but useful
    });
    if (!v) throw new NotFoundException(`Vehicle #${id} not found`);
    return v;
  }

  async create(
    dto: CreateVehicleDto,
    current: { userId?: number; role: string; vendorId?: number; driverId?: number },
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
    };

    // ✅ Connect vendor via vendorId
    if (current.role === 'VENDOR' && current.userId) {
      data.vendor = { connect: { id: current.userId } };
    } else if (dto.vendorId) {
      data.vendor = { connect: { id: dto.vendorId } };
    }

    // ❌ Skipping driver assignment at creation time unless explicitly needed

    return this.prisma.vehicle.create({ data });
  }

  async update(id: number, dto: UpdateVehicleDto) {
    const { vendorId, driverId, ...rest } = dto;

    const data: any = { ...rest };

    // Optional: Handle vendor reassignment
    if (vendorId !== undefined) {
      data.vendor = vendorId ? { connect: { id: vendorId } } : { disconnect: true };
    }

    if (driverId !== undefined) {
      data.driver = driverId ? { connect: { id: driverId } } : { disconnect: true };
    }

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
