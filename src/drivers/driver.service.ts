import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDriverDto) {
  return this.prisma.driver.create({
    data: {
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      licenseNumber: dto.licenseNumber,
      licenseExpiry: new Date(dto.licenseExpiry),
      isPartTime: dto.isPartTime ?? false,
      isAvailable: dto.isAvailable ?? true,

      vendor: dto.vendorId
        ? {
            connect: { id: dto.vendorId },
          }
        : undefined,

      assignedVehicle: dto.vehicleId
        ? {
            connect: { id: dto.vehicleId },
          }
        : undefined,

      // ✅ CREATE user instead of connect
      user: {
        create: {
          name: dto.fullName,
          email: dto.email,
          phone: dto.phone,
          password: 'default@123', // TODO: hash before save
          role: 'DRIVER',
        },
      },
    },
  });
}

  findAll() {
    return this.prisma.driver.findMany({
      include: {
        assignedVehicle: true,
        vendor: true,
        user: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.driver.findUnique({
      where: { id },
      include: {
        assignedVehicle: true,
        vendor: true,
        user: true,
      },
    });
  }

  update(id: number, dto: UpdateDriverDto) {
    return this.prisma.driver.update({
      where: { id },
      data: {
        fullName: dto.name,
        phone: dto.phone,
        email: dto.email,
        licenseNumber: dto.licenseNumber,
        licenseExpiry: new Date(dto.license_expiry),
        isPartTime: dto.is_part_time ?? false,
        isAvailable: dto.is_available ?? true,
        vendor: {
          connect: { id: Number(dto.vendor_id) },
        },
        assignedVehicle: dto.assigned_vehicle_id
          ? {
              connect: { id: Number(dto.assigned_vehicle_id) },
            }
          : undefined,
      },
    });
  }

  async getAvailableDrivers() {
    return this.prisma.driver.findMany({
      where: {
        assignedVehicleId: null,
        isAvailable: true,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
      },
    });
  }

  async assignDriverToVehicle(driverId: number, vehicleId: number) {
    if (!driverId || typeof driverId !== 'number') {
    throw new Error('Invalid driver ID');
  }
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) throw new NotFoundException('Driver not found');

    return this.prisma.driver.update({
      where: { id: driverId },
      data: {
        assignedVehicleId: vehicleId,
      },
    });
  }

  remove(id: number) {
    return this.prisma.driver.delete({ where: { id } });
  }
}
