import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDriverDto) {
   const password = await bcrypt.hash('123123', 10);
    return this.prisma.driver.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        licenseNumber: dto.licenseNumber,
        licenseExpiry: new Date(dto.licenseExpiry),
        isPartTime: dto.isPartTime ?? false,
        isAvailable: dto.isAvailable ?? true,
        licenseImage: dto.licenseImage,
        rcImage: dto.rcImage,

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

        user: {
          create: {
            name: dto.fullName,
            email: dto.email,
            phone: dto.phone,
            password: password, // TODO: hash before save
            role: 'DRIVER',
          },
        },
      },
    });
  }

  async createDriverByRole(dto: CreateDriverDto, user: any) {
    if (user.role === 'VENDOR') {
      if (!user.vendorId) {
        throw new BadRequestException('Vendor ID missing in token');
      }
      return this.create({ ...dto, vendorId: user.vendorId });
    }

    if (user.role === 'ADMIN') {
      if (!dto.vendorId) {
        throw new BadRequestException('vendorId is required when added by admin');
      }
      return this.create(dto);
    }

    throw new ForbiddenException('Only vendors or admins can add drivers');
  }

  async findDriversByRole(user: any) {
    console.log(user);
    if (user.role === 'ADMIN') {
      return this.findAll();
    }

    if (user.role === 'VENDOR') {
      if (!user.vendorId) {
        throw new BadRequestException('Vendor ID missing in token');
      }
      return this.findAllByVendor(user.vendorId);
    }

    throw new ForbiddenException('Access denied');
  }

  async findAll() {
    return this.prisma.driver.findMany({
      include: {
        assignedVehicle: true,
        vendor: true,
        user: true,
      },
    });
  }

  async findAllByVendor(vendorId: number) {
    return this.prisma.driver.findMany({
      where: { vendorId },
      include: {
        assignedVehicle: true,
        vendor: true,
        user: true,
      },
    });
  }

async findOne(id: number) {
  return this.prisma.driver.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      licenseNumber: true,
      licenseExpiry: true,
      isPartTime: true,
      isAvailable: true,
      licenseImage: true, // ✅ include license image
      rcImage: true,       // ✅ include rc image
      vendorId: true,
      assignedVehicleId: true,
      userId: true,
      assignedVehicle: true,
      vendor: true,
      user: true,
    },
  });
}

  async update(id: number, dto: UpdateDriverDto) {
    return this.prisma.driver.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        licenseNumber: dto.licenseNumber,
        licenseExpiry: new Date(dto.licenseExpiry),
        isPartTime: dto.isPartTime ?? false,
        isAvailable: dto.isAvailable ?? true,
        vendor: {
          connect: { id: Number(dto.vendorId) },
        },
        assignedVehicle: dto.assignedVehicleId
          ? {
              connect: { id: Number(dto.assignedVehicleId) },
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
      throw new BadRequestException('Invalid driver ID');
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

  async remove(id: number) {
    return this.prisma.driver.delete({ where: { id } });
  }
}
