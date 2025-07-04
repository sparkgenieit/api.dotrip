import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDriverDto) {
  const {
    fullName,
    licenseNumber,
    licenseExpiry,
    phone,
    email,
    userId,
    vendorId,
    vehicleId,
  } = dto;

  return this.prisma.driver.create({
    data: {
      fullName,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      phone,
      email,
      user: {
        connect: { id: userId },
      },
      ...(typeof vendorId === 'number' && {
        vendor: {
          connect: { id: vendorId },
        },
      }),
      ...(typeof vehicleId === 'number' && {
        assignedVehicle: {
          connect: { id: vehicleId },
        },
      }),
    },
  });
}

  findAll() {
    return this.prisma.driver.findMany({
      include: {
        vendor: true,
        assignedVehicle: true,
        user: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.driver.findUnique({
      where: { id: parseInt(id) },
      include: {
        vendor: true,
        assignedVehicle: true,
        user: true,
      },
    });
  }

  async update(id: string, dto: UpdateDriverDto) {
    const {
      fullName,
      licenseNumber,
      phone,
      email,
      userId,
      vendorId,
      vehicleId,
    } = dto;

    return this.prisma.driver.update({
      where: { id: parseInt(id) },
      data: {
        fullName,
        licenseNumber,
        phone,
        email,
        user: {
          connect: { id: userId },
        },
        vendor: {
          connect: { id: vendorId },
        },
        ...(vehicleId && {
          assignedVehicle: {
            connect: { id: vehicleId },
          },
        }),
      },
    });
  }

  remove(id: string) {
    return this.prisma.driver.delete({
      where: { id: parseInt(id) },
    });
  }
}
