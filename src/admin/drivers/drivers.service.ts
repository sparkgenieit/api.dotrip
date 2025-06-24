import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hash } from 'bcryptjs';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { RegisterDriverDto } from './dto/register-driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.driver.findMany({
      include: {
        user: {
          include: {
            vehiclesAsDriver: true, // <- get vehicle via user
          },
        },
        vendor: true,
      },
    });
  }

  async findOne(id: number) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            vehiclesAsDriver: true,
          },
        },
        vendor: true,
      },
    });
    if (!driver) throw new NotFoundException(`Driver #${id} not found`);
    return driver;
  }

  async create(dto: CreateDriverDto) {
    const { userId, vendorId, vehicleId, ...rest } = dto;

    const driver = await this.prisma.driver.create({
      data: {
        ...rest,
        user: { connect: { id: userId } },
        ...(vendorId ? { vendor: { connect: { id: vendorId } } } : {}),
      },
    });

    // assign vehicle.driverId = userId (if provided)
    if (vehicleId) {
      await this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { driverId: userId },
      });
    }

    return driver;
  }

  async update(id: number, dto: UpdateDriverDto) {
    const { userId, vendorId, vehicleId, ...rest } = dto as any;
    const data: any = { ...rest };
    if (userId !== undefined) data.user = { connect: { id: userId } };
    if (vendorId !== undefined)
      data.vendor = vendorId ? { connect: { id: vendorId } } : { disconnect: true };

    const driver = await this.prisma.driver.update({ where: { id }, data });

    if (userId !== undefined && vehicleId !== undefined) {
      await this.prisma.vehicle.updateMany({
        where: { driverId: userId },
        data: { driverId: null }, // unassign existing vehicles
      });

      if (vehicleId) {
        await this.prisma.vehicle.update({
          where: { id: vehicleId },
          data: { driverId: userId },
        });
      }
    }

    return driver;
  }

  async remove(id: number) {
    const driver = await this.findOne(id);
    await this.prisma.vehicle.updateMany({
      where: { driverId: driver.userId },
      data: { driverId: null },
    });
    return this.prisma.driver.delete({ where: { id } });
  }

  async register(dto: RegisterDriverDto) {
    const hashed = await hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        phone: dto.phone,
        name: dto.name,
        role: 'DRIVER',
      },
    });

    const driver = await this.prisma.driver.create({
      data: {
        name: dto.name,
        license: dto.license,
        user: { connect: { id: user.id } },
        ...(dto.vendorId ? { vendor: { connect: { id: dto.vendorId } } } : {}),
      },
    });

    if (dto.vehicleId) {
      await this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: { driverId: user.id },
      });
    }

    return { user, driver };
  }
}
