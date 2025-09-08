// src/drivers/driver.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

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

      // images
      licenseImage: dto.licenseImage,
      rcImage: dto.rcImage,
      profileImage: dto.profileImage, // NEW

      // new profile fields
      whatsappPhone: dto.whatsappPhone,
      altPhone: dto.altPhone,
      licenseIssueDate: dto.licenseIssueDate ? new Date(dto.licenseIssueDate) : undefined,
      dob: dto.dob ? new Date(dto.dob) : undefined,
      gender: dto.gender,
      bloodGroup: dto.bloodGroup,
      aadhaarNumber: dto.aadhaarNumber,
      panNumber: dto.panNumber,
      voterId: dto.voterId,
      address: dto.address,

      // relations
      vendor: dto.vendorId ? { connect: { id: dto.vendorId } } : undefined,

      // (optional) allow assign-on-create if vehicleId posted
      assignedVehicle: dto.vehicleId ? { connect: { id: dto.vehicleId } } : undefined,

      user: {
        create: {
          name: dto.fullName,
          email: dto.email,
          phone: dto.phone,
          password: password, // already hashed
          role: 'DRIVER',
        },
      },
    },
    include: {
      assignedVehicle: true,
      vendor: true,
      user: true,
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
    if (user.role === 'ADMIN') {
      return this.findAll();
    }

    if (user.role === 'VENDOR') {
      if (!user.id) {
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

      // images
      licenseImage: true,
      rcImage: true,
      profileImage: true, // NEW

      // new profile fields
      whatsappPhone: true,
      altPhone: true,
      licenseIssueDate: true,
      dob: true,
      gender: true,
      bloodGroup: true,
      aadhaarNumber: true,
      panNumber: true,
      voterId: true,
      address: true,

      vendorId: true,
      assignedVehicleId: true,
      userId: true,
      assignedVehicle: true,
      vendor: true,
      user: true,
    },
  });
}

  // ✅ Partial, safe update. Only updates fields that are provided.
  //    Also writes licenseImage / rcImage when controller sets them.
  async update(id: number, dto: UpdateDriverDto) {
    const data: Prisma.DriverUpdateInput = {};

    // basics
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.licenseNumber !== undefined) data.licenseNumber = dto.licenseNumber;

    // dates
    if (dto.licenseExpiry) data.licenseExpiry = new Date(dto.licenseExpiry);

    // booleans
    if (typeof dto.isPartTime === 'boolean') data.isPartTime = dto.isPartTime;
    if (typeof dto.isAvailable === 'boolean') data.isAvailable = dto.isAvailable;

    // images
    if (dto.licenseImage !== undefined) data.licenseImage = dto.licenseImage;
    if (dto.rcImage !== undefined) data.rcImage = dto.rcImage;
    if (dto.profileImage !== undefined) data.profileImage = dto.profileImage; // NEW

    // new profile fields
    if (dto.whatsappPhone !== undefined) data.whatsappPhone = dto.whatsappPhone;
    if (dto.altPhone !== undefined) data.altPhone = dto.altPhone;
    if (dto.licenseIssueDate) data.licenseIssueDate = new Date(dto.licenseIssueDate);
    if (dto.dob) data.dob = new Date(dto.dob);
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.bloodGroup !== undefined) data.bloodGroup = dto.bloodGroup;
    if (dto.aadhaarNumber !== undefined) data.aadhaarNumber = dto.aadhaarNumber;
    if (dto.panNumber !== undefined) data.panNumber = dto.panNumber;
    if (dto.voterId !== undefined) data.voterId = dto.voterId;
    if (dto.address !== undefined) data.address = dto.address;

    // relations
    if (dto.vendorId !== undefined) {
      if (dto.vendorId === null as any) {
        data.vendor = { disconnect: true };
      } else {
        data.vendor = { connect: { id: Number(dto.vendorId) } };
      }
    }

    // Prefer PATCH /drivers/assign, but allow direct update if sent
    if (dto.assignedVehicleId !== undefined) {
      if (dto.assignedVehicleId === null as any) {
        data.assignedVehicle = { disconnect: true };
      } else {
        data.assignedVehicle = { connect: { id: Number(dto.assignedVehicleId) } };
      }
    }

    return this.prisma.driver.update({
      where: { id },
      data,
      include: {
        assignedVehicle: true,
        vendor: true,
        user: true,
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
