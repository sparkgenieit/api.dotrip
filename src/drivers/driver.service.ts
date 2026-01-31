
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// DTOs
import { CreateDriverBasicDto } from './dto/create-driver-basic.dto';
import { UpdateDriverBasicDto } from './dto/update-driver-basic.dto';
import { UpdateDriverCostDto } from './dto/update-driver-cost.dto';
import { UpdateDriverFeedbackDto } from './dto/update-driver-feedback.dto';

type UploadFile = Express.Multer.File | undefined;

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  /** Guard: verify driver exists */
  async ensureDriver(id: number) {
    return this.prisma.driver.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  async assignVehicle(driverId: number, vehicleId: number | null) {
  // Ensure driver exists
  const driver = await this.prisma.driver.findUnique({
    where: { id: driverId },
    select: { id: true },
  });
  if (!driver) throw new NotFoundException('Driver not found');

  // Unassign
  if (vehicleId == null) {
    return this.prisma.driver.update({
      where: { id: driverId },
      data: { assignedVehicleId: null },
      select: { id: true, assignedVehicleId: true },
    });
  }

  // Ensure vehicle exists
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id: Number(vehicleId) },
    select: { id: true },
  });
  if (!vehicle) throw new NotFoundException('Vehicle not found');

  // Assign (unique constraint on Driver.assignedVehicleId ensures 1 driver per vehicle)
  try {
    return await this.prisma.driver.update({
      where: { id: driverId },
      data: { assignedVehicleId: Number(vehicleId) },
      select: { id: true, assignedVehicleId: true },
    });
  } catch (e: any) {
    // Prisma P2002 = Unique constraint failed (vehicle already assigned)
    if (e?.code === 'P2002') {
      throw new ConflictException('This vehicle is already assigned to another driver.');
    }
    throw e;
  }
}

  /** CREATE — Basic tab first submit (POST /drivers) */
  async createBasic(dto: CreateDriverBasicDto, profile?: UploadFile) {
    const data: any = {
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email ?? null,
      whatsappPhone: dto.whatsappPhone ?? null,
      altPhone: dto.altPhone ?? null,

      licenseNumber: dto.licenseNumber,
      licenseExpiry: new Date(dto.licenseExpiry),
      licenseIssueDate: dto.licenseIssueDate ? new Date(dto.licenseIssueDate) : null,

      dob: dto.dob ? new Date(dto.dob) : null,
      gender: dto.gender ?? null,
      bloodGroup: dto.bloodGroup ?? null,

      aadhaarNumber: dto.aadhaarNumber ?? null,
      panNumber: dto.panNumber ?? null,
      voterId: dto.voterId ?? null,

      address: dto.address ?? null,
    };

    if (dto.vendorId !== undefined && dto.vendorId !== null) {
      data.vendorId = Number(dto.vendorId);
    }
    if (profile) {
      data.profileImage = `/uploads/drivers/${profile.filename}`;
    }

    return this.prisma.driver.create({ data });
  }

  /** BASIC TAB — Update existing Driver (PATCH /drivers/:id/basic) */
  async updateBasic(id: number, dto: UpdateDriverBasicDto, profile?: UploadFile) {
    const data: any = {};

    if (dto.fullName) data.fullName = dto.fullName;
    if (dto.phone) data.phone = dto.phone;
    if (dto.email) data.email = dto.email;

    if (dto.whatsappPhone) data.whatsappPhone = dto.whatsappPhone;
    if (dto.altPhone) data.altPhone = dto.altPhone;

    if (dto.licenseNumber) data.licenseNumber = dto.licenseNumber;
    if (dto.licenseIssueDate) data.licenseIssueDate = new Date(dto.licenseIssueDate);
    if (dto.licenseExpiry) data.licenseExpiry = new Date(dto.licenseExpiry);

    if (dto.dob) data.dob = new Date(dto.dob);
    if (dto.gender) data.gender = dto.gender;
    if (dto.bloodGroup) data.bloodGroup = dto.bloodGroup;

    if (dto.aadhaarNumber) data.aadhaarNumber = dto.aadhaarNumber;
    if (dto.panNumber) data.panNumber = dto.panNumber;
    if (dto.voterId) data.voterId = dto.voterId;

    if (dto.address) data.address = dto.address;
    if (dto.vendorId !== undefined && dto.vendorId !== null) {
      data.vendorId = Number(dto.vendorId);
    }

    if (profile) {
      data.profileImage = `/uploads/drivers/${profile.filename}`;
    }

    return this.prisma.driver.update({
      where: { id },
      data,
    });
  }

  /** COST DETAILS TAB — Upsert to DriverCostDetails (PK = driverId) */
  async upsertCostDetails(id: number, dto: UpdateDriverCostDto) {
    const patch: any = {};
    if (dto.driverSalary !== undefined) patch.driverSalary = dto.driverSalary;
    if (dto.foodCost !== undefined) patch.foodCost = dto.foodCost;
    if (dto.accommodationCost !== undefined) patch.accommodationCost = dto.accommodationCost;
    if (dto.bhattaCost !== undefined) patch.bhattaCost = dto.bhattaCost;
    if (dto.earlyMorningCharges !== undefined) patch.earlyMorningCharges = dto.earlyMorningCharges;
    if (dto.eveningCharges !== undefined) patch.eveningCharges = dto.eveningCharges;

    return this.prisma.driverCostDetails.upsert({
      where: { driverId: id },
      create: { driverId: id, ...patch },
      update: { ...patch },
      include: { driver: { select: { id: true, fullName: true } } },
    });
  }

  /**
   * DOCUMENTS TAB — Upsert to DriverDocuments (PK = driverId)
   * Mirrors licenseUrl to Driver.licenseImage for preview convenience.
   */
  async upsertDocuments(
    id: number,
    files: {
      aadhar?: UploadFile;
      pan?: UploadFile;
      voter?: UploadFile;
      license?: UploadFile;
    },
  ) {
    const patch: any = {};
    if (files.aadhar)  patch.aadharUrl  = `/uploads/drivers/docs/${files.aadhar.filename}`;
    if (files.pan)     patch.panUrl     = `/uploads/drivers/docs/${files.pan.filename}`;
    if (files.voter)   patch.voterUrl   = `/uploads/drivers/docs/${files.voter.filename}`;
    if (files.license) patch.licenseUrl = `/uploads/drivers/docs/${files.license.filename}`;

    return this.prisma.$transaction(async (trx) => {
      const docs = await trx.driverDocuments.upsert({
        where: { driverId: id },
        create: { driverId: id, ...patch },
        update: { ...patch },
      });

      if (patch.licenseUrl) {
        await trx.driver.update({
          where: { id },
          data: { licenseImage: patch.licenseUrl },
        });
      }

      return docs;
    });
  }

  /** FEEDBACK / REVIEW TAB — Upsert to DriverFeedbackMeta (PK = driverId) */
  async upsertFeedback(id: number, dto: UpdateDriverFeedbackDto) {
    const patch: any = {};
    if (dto.ratingAvg !== undefined) patch.ratingAvg = dto.ratingAvg;
    if (dto.remarks !== undefined) patch.remarks = dto.remarks;
    if (dto.reviews !== undefined) patch.reviews = dto.reviews;

    return this.prisma.driverFeedbackMeta.upsert({
      where: { driverId: id },
      create: { driverId: id, ...patch },
      update: { ...patch },
    });
  }

    async deleteDriver(id: number) {
    // ensure exists
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    // block deletion if linked to trips
    const tripCount = await this.prisma.trip.count({ where: { driverId: id } });
    if (tripCount > 0) {
      throw new ConflictException(
        'Cannot delete driver with existing trips. Reassign or delete those trips first.',
      );
    }

    await this.prisma.$transaction(async (trx) => {
      // Delete optional tab rows if present
      await trx.driverCostDetails.delete({ where: { driverId: id } }).catch(() => undefined);
      await trx.driverDocuments.delete({ where: { driverId: id } }).catch(() => undefined);
      await trx.driverFeedbackMeta.delete({ where: { driverId: id } }).catch(() => undefined);

      // Unlink vehicles that reference this driver as owner (if you use that relation)
      await trx.vehicle.updateMany({
        where: { driverOwnerId: id },
        data: { driverOwnerId: null },
      });

      // Finally delete the driver
      await trx.driver.delete({ where: { id } });
    });

    return { success: true, id };
  }

  /** Used by Edit/Preview to hydrate all tab data in one request. */
  async getDriverFull(id: number) {
    return this.prisma.driver.findUnique({
      where: { id },
      include: {
        costDetails: true,    // DriverCostDetails
        documents: true,      // DriverDocuments
        feedbackMeta: true,   // DriverFeedbackMeta
      },
    });
  }

  /** LIST — pagination + filters (GET /drivers) */
  async listDrivers(args: {
    page: number;
    pageSize: number;
    q?: string;
    vendorId?: number;
    available?: boolean;
  }) {
    const { page, pageSize, q, vendorId, available } = args;
    const where: any = {};

    if (q && q.trim()) {
      where.OR = [
        { fullName:      { contains: q, mode: 'insensitive' } },
        { phone:         { contains: q } },
        { email:         { contains: q, mode: 'insensitive' } },
        { licenseNumber: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (vendorId != null) where.vendorId = vendorId;
    if (typeof available === 'boolean') where.isAvailable = available;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.driver.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          licenseNumber: true,
          isAvailable: true,
          vendorId: true,
          profileImage: true,
        },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }
}
