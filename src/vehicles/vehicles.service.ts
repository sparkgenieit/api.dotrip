import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { vendorId?: number; driverOwnerId?: number }) {
    return this.prisma.vehicle.findMany({
      where: {
        ...(filters.vendorId ? { vendorId: filters.vendorId } : {}),
        ...(filters.driverOwnerId ? { driverOwnerId: filters.driverOwnerId } : {}),
      },
      include: {
        vendor: true,
        driver: true,
        vehicleType:true,
      },
    });
  }

  async findOne(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        vendor: true,
        driver: true,
        vehicleType: true,
      },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle #${id} not found`);
    return vehicle;
  }

async getAvailableVehicles(typeId: number, vendorUserId: number) {
  return this.prisma.vehicle.findMany({
    where: {
      status: 'available',
      vehicleTypeId: typeId,
      vendor: {
        userId: vendorUserId, // 🔒 filter by vendor user
      },
    },
    include: {
      driver: true,
      vendor: true,
    },
  });
}

  async create(
    dto: CreateVehicleDto,
    current: {
      userId?: number;
      role: string;
      vendorId?: number;
      driverId?: number;
    }
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
      status: dto.status ?? "available",
      comfortLevel: dto.comfortLevel ?? 3,
      lastServicedDate: dto.lastServicedDate
        ? new Date(dto.lastServicedDate)
        : undefined,
      createdBy: current.role,
    };

    if (current.role === "VENDOR" && current.vendorId) {
      data.vendorId = current.vendorId;
    } else if (current.role === "DRIVER" && current.driverId) {
      data.driverOwnerId = current.driverId;
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

    if (vendorId !== undefined) {
      data.vendorId = vendorId || null;
    }

    return this.prisma.vehicle.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.vehicle.delete({ where: { id } });
  }

  async register(
    dto: CreateVehicleDto,
    current: {
      userId?: number;
      role: string;
      vendorId?: number;
      driverId?: number;
    }
  ) {
    return this.create(dto, current);
  }
}
