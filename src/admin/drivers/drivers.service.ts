import { Injectable,BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

// 🔁 REPLACE
async create(dto: CreateDriverDto) {
  const {
    fullName,
    licenseNumber,
    licenseExpiry,
    phone,
    email,
    vendorId,
    vehicleId,
  } = dto;

  // ✅ Check if user exists or create
  let user = await this.prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await this.prisma.user.create({
      data: {
        email,
        phone,
        name: fullName,
        role: 'DRIVER', // ensure enum value matches your schema
        password: `driver@${Date.now()}`, // dummy password
      },
    });
  }

  // ✅ Ensure vendor exists
  const vendor = await this.prisma.vendor.findUnique({
    where: { id: vendorId },
  });

  if (!vendor) {
    throw new BadRequestException(`Vendor with ID ${vendorId} does not exist.`);
  }

  // ✅ Create driver
  return this.prisma.driver.create({
    data: {
      fullName,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      phone,
      email,
      user: {
        connect: { id: user.id },
      },
      vendor: {
        connect: { id: vendorId },
      },
      assignedVehicle: {
        connect: { id: vehicleId },
      },
    },
  });
}
// 🔁 END




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
