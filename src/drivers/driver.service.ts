import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDriverDto) {
    return this.prisma.driver.create({
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
        user: {
          create: {
            name: dto.name,
            email: dto.email,
            password: 'default@123', // You should hash this in production
            phone: dto.phone,
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

  remove(id: number) {
    return this.prisma.driver.delete({ where: { id } });
  }
}
