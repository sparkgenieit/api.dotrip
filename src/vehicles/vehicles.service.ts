import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

function toDateOrNull(s?: string | null): Date | null {
  if (!s) return null;
  // "YYYY-MM-DD" → ok
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00.000Z');
  // "DD-MM-YYYY" → convert
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00.000Z`);
  // fallback
  const d = new Date(s);
  return isNaN(+d) ? null : d;
}

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
  current: { userId?: number; role: string; vendorId?: number; driverId?: number },
) {
  const toDateOrNull = (s?: string | null): Date | null => {
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00.000Z`);
    const d = new Date(s);
    return Number.isNaN(+d) ? null : d;
  };
  const toNumOrNull = (v: any) => {
    if (v === '' || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // normalize + validate reg.no.
  const reg = (dto.registrationNumber ?? '').trim().toUpperCase();
  if (!reg) throw new BadRequestException('registrationNumber is required');

  // pre-check uniqueness for clearer error & to return existing id
  const dup = await this.prisma.vehicle.findUnique({
    where: { registrationNumber: reg },
    select: { id: true },
  });
  if (dup) {
    throw new ConflictException({
      message: 'Vehicle with this registration number already exists',
      code: 'VEHICLE_DUPLICATE_REG',
      vehicleId: dup.id,
    });
  }

  const data: any = {
    image: dto.image ?? '',
    additional_images: dto.additional_images ?? undefined,

    registrationNumber: reg,
    chassisNumber: dto.chassisNumber ?? null,

    vehicleTypeId: Number(dto.vehicleTypeId),
    status: dto.status ?? 'available',

    lastServicedDate: toDateOrNull(dto.lastServicedDate),
    vehicleExpiryDate: toDateOrNull(dto.vehicleExpiryDate),

    extraKmCharge: toNumOrNull(dto.extraKmCharge),
    earlyMorningCharges: toNumOrNull(dto.earlyMorningCharges),
    eveningCharges: toNumOrNull(dto.eveningCharges),
    videoUrl: dto.videoUrl ?? null,

    insurancePolicyNumber: dto.insurancePolicyNumber ?? null,
    insuranceContactNumber: dto.insuranceContactNumber ?? null,
    rtoCode: dto.rtoCode ?? null,
    insuranceStartDate: toDateOrNull(dto.insuranceStartDate),
    insuranceEndDate: toDateOrNull(dto.insuranceEndDate),

    createdBy: (current?.role as any) ?? undefined,
  };

  // ownership
  if (current?.role === 'VENDOR' && current.vendorId) {
    data.vendorId = current.vendorId;
  } else if (current?.role === 'DRIVER' && current.driverId) {
    data.driverOwnerId = current.driverId;
  } else if (dto.vendorId != null) {
    data.vendorId = Number(dto.vendorId);
  }

  try {
    return await this.prisma.vehicle.create({
      data,
      include: { vendor: true },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException({
        message: 'Vehicle with this registration number already exists',
        code: 'VEHICLE_DUPLICATE_REG',
      });
    }
    throw e;
  }
}

// REPLACE this whole block in src/vehicles/vehicles.service.ts  (#realcode)

async update(id: number, dto: UpdateVehicleDto) {
  const toDateOrNull = (s?: string | null): Date | null => {
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00.000Z`);
    const d = new Date(s);
    return Number.isNaN(+d) ? null : d;
  };
  const toNumOrUndef = (v: any) => {
    if (v === '' || v == null) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const existing = await this.prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw new NotFoundException('Vehicle not found');

  const data: any = {};

  // normalize reg.no. and ensure uniqueness (excluding self)
  if (dto.registrationNumber !== undefined) {
    const reg = (dto.registrationNumber ?? '').trim().toUpperCase();
    if (!reg) throw new ConflictException('registrationNumber cannot be empty');
    const dup = await this.prisma.vehicle.findUnique({
      where: { registrationNumber: reg },
      select: { id: true },
    });
    if (dup && dup.id !== id) {
      throw new ConflictException({
        message: 'Vehicle with this registration number already exists',
        code: 'VEHICLE_DUPLICATE_REG',
        vehicleId: dup.id,
      });
    }
    data.registrationNumber = reg;
  }

  if (dto.image !== undefined) data.image = dto.image ?? '';
  if (dto.additional_images !== undefined) data.additional_images = dto.additional_images;

  if (dto.chassisNumber !== undefined) data.chassisNumber = dto.chassisNumber ?? null;
  if (dto.status !== undefined) data.status = dto.status;

  if (dto.vehicleTypeId !== undefined) data.vehicleTypeId = Number(dto.vehicleTypeId);
  if (dto.vendorId !== undefined) data.vendorId = dto.vendorId == null ? null : Number(dto.vendorId);

  if (dto.lastServicedDate !== undefined) data.lastServicedDate = toDateOrNull(dto.lastServicedDate);
  if (dto.vehicleExpiryDate !== undefined) data.vehicleExpiryDate = toDateOrNull(dto.vehicleExpiryDate);

  if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl ?? null;

  if (dto.extraKmCharge !== undefined) data.extraKmCharge = toNumOrUndef(dto.extraKmCharge);
  if (dto.earlyMorningCharges !== undefined) data.earlyMorningCharges = toNumOrUndef(dto.earlyMorningCharges);
  if (dto.eveningCharges !== undefined) data.eveningCharges = toNumOrUndef(dto.eveningCharges);

  if (dto.insurancePolicyNumber !== undefined) data.insurancePolicyNumber = dto.insurancePolicyNumber ?? null;
  if (dto.insuranceContactNumber !== undefined) data.insuranceContactNumber = dto.insuranceContactNumber ?? null;
  if (dto.rtoCode !== undefined) data.rtoCode = dto.rtoCode ?? null;
  if (dto.insuranceStartDate !== undefined) data.insuranceStartDate = toDateOrNull(dto.insuranceStartDate);
  if (dto.insuranceEndDate !== undefined) data.insuranceEndDate = toDateOrNull(dto.insuranceEndDate);

  try {
    return await this.prisma.vehicle.update({
      where: { id },
      data,
      include: { vendor: true },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException({
        message: 'Vehicle with this registration number already exists',
        code: 'VEHICLE_DUPLICATE_REG',
      });
    }
    throw e;
  }
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