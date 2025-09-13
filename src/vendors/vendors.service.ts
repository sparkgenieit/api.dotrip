// === FILE: src/vendors/vendors.service.ts ==================================
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, Vendor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateVendorDto, UpdateVendorDto, UpsertBranchesDto,
  UpsertDriverCostsDto, UpsertExtraCostsDto, UpsertLocalLimitsDto, UpsertLocalChargesDto,
  UpsertOutstationLimitsDto, UpsertOutstationChargesDto, UpsertPermitCostsDto,
  CreateVehicleLiteDto,
} from './dto/vendor.dto';
import * as bcrypt from 'bcryptjs';

function toRel(p?: string | null) {
  if (!p) return '';
  const rel = p.replace(process.cwd(), '').replace(/\\/g, '/');
  return rel.startsWith('/') ? rel : `/${rel}`;
}

type VehicleFiles = {
  image?: Express.Multer.File;
  gallery?: Express.Multer.File[];
};

/* === ADD: normalize & merge helpers for additional_images === */
function asPathArray(json: any): string[] {
  // If already a simple string[]
  if (Array.isArray(json) && (json.length === 0 || typeof json[0] === 'string')) {
    return json as string[];
  }
  // If legacy shape: [{ url, type }] or [{ url }]
  if (Array.isArray(json) && json.length && typeof json[0] === 'object') {
    return (json as any[])
      .map((it) => (typeof it?.url === 'string' ? it.url : null))
      .filter(Boolean) as string[];
  }
  // If legacy shape: { files: [...] }
  if (json && typeof json === 'object' && Array.isArray(json.files)) {
    return (json.files as any[])
      .map((it) => (typeof it === 'string' ? it : (typeof it?.url === 'string' ? it.url : null)))
      .filter(Boolean) as string[];
  }
  return [];
}

function mergePaths(prevJson: any, incoming?: string[]) {
  const prev = asPathArray(prevJson);
  const next = Array.from(new Set([ ...prev, ...(incoming ?? []) ]));
  return next;
}

function parsePct(input?: string | number | null, fallback?: number): number | null {
  if (input === null || input === undefined) return fallback ?? null;
  if (typeof input === 'number') return input;
  const onlyDigits = String(input).replace(/[^\d]/g, '');
  return onlyDigits ? Number(onlyDigits) : fallback ?? null;
}
function makeRangeKey(start?: Date | null, end?: Date | null): string {
  const s = start ? start.toISOString().slice(0, 10) : 'ALL';
  const e = end ? end.toISOString().slice(0, 10) : 'ALL';
  return `${s}..${e}`;
}

function toNumU(v: any): number | null | undefined {
  // undefined -> undefined (omit from PATCH)
  // null / ''  -> null (clear)
  // otherwise  -> Number(...) when finite else null
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  // ---------------- Tab 1: Basic Info -----------------------------------------
  async createVendor(data: CreateVendorDto): Promise<Vendor> {
  // hash the incoming password if provided; fallback to a sensible default
  const rawPassword = (data as any)?.password as string | undefined;
  const passwordHash =
  rawPassword && rawPassword.trim().length
    ? await bcrypt.hash(rawPassword, 10)
    : await bcrypt.hash('Vndr@123', 10);

  // If email is provided, create/connect the login user alongside vendor
  const withUser =
    data.email && String(data.email).trim().length
      ? {
          vendor: {
            connectOrCreate: {
              where: { email: data.email },
              create: {
                name: data.name,
                email: data.email,
                phone: data.primaryMobile ?? data.altMobile ?? data.otherNumber ?? null,
                password: passwordHash, // ⬅ rename to `passwordHash` if your User model uses that field
                role: 'VENDOR',
              },
            },
          },
        }
      : {};

  return this.prisma.vendor.create({
    data: {
      name: data.name,
      companyReg: `VND-${Date.now()}`,
      email: data.email,
      primaryMobile: data.primaryMobile,
      altMobile: data.altMobile,
      otherNumber: data.otherNumber,
      country: data.country,
      state: data.state,
      city: data.city,
      pincode: data.pincode,
      address: data.address,
      logoUrl: data.logoUrl,
      invoiceCompanyName: data.invoiceCompanyName,
      invoiceAddress: data.invoiceAddress,
      invoicePincode: data.invoicePincode,
      invoiceGstin: data.invoiceGstin,
      invoicePan: data.invoicePan,
      invoiceContactNo: data.invoiceContactNo,
      invoiceEmail: data.invoiceEmail,
      vendorMarginPercent: data.vendorMarginPercent != null ? Number(data.vendorMarginPercent) : null,
      vendorMarginGstType: data.vendorMarginGstType,
      vendorMarginGstPct: parsePct(data.vendorMarginGstPct),
      // 👇 link/login user
      ...(withUser as any),
    },
  });
}

  async updateVendor(id: number, data: UpdateVendorDto): Promise<Vendor> {
  // Figure out if a user is already linked (relation name `vendor` → User)
  const current = await this.prisma.vendor.findUnique({
    where: { id },
    select: { id: true, vendor: { select: { id: true, email: true } } },
  });
  if (!current) throw new NotFoundException('Vendor not found');

  // Build nested relation mutation for the linked login user
  let vendorUserMutation: Prisma.VendorUpdateInput['vendor'] | undefined;

  // Prepare password patch if provided
  const rawPassword = (data as any)?.password as string | undefined;
const passwordPatch =
  rawPassword && rawPassword.trim().length
    ? { password: await bcrypt.hash(rawPassword, 10) } // rename key to `passwordHash` if your User model uses that
    : {};

  if (current.vendor?.id) {
    // already linked → update the existing user
    vendorUserMutation = {
      update: {
        name: data.name ?? undefined,
        email: data.email ?? undefined,
        phone: data.primaryMobile ?? data.altMobile ?? data.otherNumber ?? undefined,
        role: 'VENDOR',
        ...(passwordPatch as any),
      },
    };
  } else if (data.email && String(data.email).trim().length) {
    // not linked yet → create or connect by email
    vendorUserMutation = {
      connectOrCreate: {
        where: { email: data.email },
        create: {
          name: data.name ?? 'Vendor',
          email: data.email,
          phone: data.primaryMobile ?? data.altMobile ?? data.otherNumber ?? null,
          role: 'VENDOR',
          ...(Object.keys(passwordPatch).length ? passwordPatch : { password: await bcrypt.hash('Vndr@123', 10) }),
        },
      },
    };
  } // else: no email provided and no existing user -> skip linking

  return this.prisma.vendor.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      primaryMobile: data.primaryMobile,
      altMobile: data.altMobile,
      otherNumber: data.otherNumber,
      country: data.country,
      state: data.state,
      city: data.city,
      pincode: data.pincode,
      address: data.address,
      logoUrl: data.logoUrl,
      invoiceCompanyName: data.invoiceCompanyName,
      invoiceAddress: data.invoiceAddress,
      invoicePincode: data.invoicePincode,
      invoiceGstin: data.invoiceGstin,
      invoicePan: data.invoicePan,
      invoiceContactNo: data.invoiceContactNo,
      invoiceEmail: data.invoiceEmail,
      vendorMarginPercent: data.vendorMarginPercent != null ? Number(data.vendorMarginPercent) : null,
      vendorMarginGstType: data.vendorMarginGstType,
      vendorMarginGstPct: parsePct(data.vendorMarginGstPct),
      // 👇 keep user in sync / link on first update
      ...(vendorUserMutation ? { vendor: vendorUserMutation } : {}),
    },
  });
}

  getVendor(id: number) {
    return this.prisma.vendor.findUnique({ where: { id } });
  }

  // ---------------- Tab 2: Branches -------------------------------------------
  async listBranches(vendorId: number) {
    return this.prisma.vendorBranch.findMany({
      where: { vendorId },
      orderBy: { id: 'asc' },
    });
  }

  async upsertBranches(vendorId: number, dto: UpsertBranchesDto) {
    const keepIds = dto.branches.filter(b => !!b.id).map(b => Number(b.id));
    await this.prisma.vendorBranch.deleteMany({
      where: { vendorId, ...(keepIds.length ? { id: { notIn: keepIds } } : {}) },
    });

    const ops = dto.branches.map((b) =>
      this.prisma.vendorBranch.upsert({
        where: { id: b.id ?? -1 },
        update: {
          name: b.name,
          location: b.location,
          email: b.email,
          primaryMobile: b.primaryMobile,
          altMobile: b.altMobile,
          country: b.country,
          state: b.state,
          city: b.city,
          pincode: b.pincode,
          gstType: (b.gstType as string) ?? null,
          gstPercent: parsePct(b.gstPercent, null),
          address: b.address,
        },
        create: {
          vendorId,
          name: b.name,
          location: b.location,
          email: b.email,
          primaryMobile: b.primaryMobile,
          altMobile: b.altMobile,
          country: b.country,
          state: b.state,
          city: b.city,
          pincode: b.pincode,
          gstType: (b.gstType as string) ?? null,
          gstPercent: parsePct(b.gstPercent, null),
          address: b.address,
        },
      })
    );
    return this.prisma.$transaction(ops);
  }

  // ---------------- Tab 3/5: Driver Costs -------------------------------------
  async listDriverCosts(vendorId: number) {
    const rows = await this.prisma.vendorDriverCost.findMany({
      where: { vendorId },
      include: { vehicleType: true },
      orderBy: { vehicleTypeId: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      vehicleTypeId: r.vehicleTypeId,
      vehicleTypeName: r.vehicleType.name,
      driverBhatta: r.driverBhatta,
      foodCost: r.foodCost,
      accomodationCost: r.accomodationCost,
      extraCost: r.extraCost,
      morningChargesPerHour: r.morningPerHour,
      eveningChargesPerHour: r.eveningPerHour,
    }));
  }

  async upsertDriverCosts(vendorId: number, dto: UpsertDriverCostsDto) {
    const ops = dto.rows.map((row) =>
      this.prisma.vendorDriverCost.upsert({
        where: { vendorId_vehicleTypeId: { vendorId, vehicleTypeId: row.vehicleTypeId } },
        update: {
          driverBhatta: row.driverBhatta,
          foodCost: row.foodCost,
          accomodationCost: row.accomodationCost,
          extraCost: row.extraCost,
          morningPerHour: row.morningPerHour,
          eveningPerHour: row.eveningPerHour,
        },
        create: {
          vendorId,
          vehicleTypeId: row.vehicleTypeId,
          driverBhatta: row.driverBhatta,
          foodCost: row.foodCost,
          accomodationCost: row.accomodationCost,
          extraCost: row.extraCost,
          morningPerHour: row.morningPerHour,
          eveningPerHour: row.eveningPerHour,
        },
      })
    );
    await this.prisma.$transaction(ops);
    return this.listDriverCosts(vendorId);
  }

  // ---------------- Tab 5: Extra Costs ----------------------------------------
  async upsertExtraCosts(vendorId: number, dto: UpsertExtraCostsDto) {
    const ops = dto.rows.map((row) =>
      this.prisma.vendorVehicleExtraCost.upsert({
        where: { vendorId_vehicleTypeId: { vendorId, vehicleTypeId: row.vehicleTypeId } },
        update: {
          extraKm: row.extraKm,
          extraHour: row.extraHour,
          earlyMorning: row.earlyMorning,
          evening: row.evening,
        },
        create: {
          vendorId,
          vehicleTypeId: row.vehicleTypeId,
          extraKm: row.extraKm,
          extraHour: row.extraHour,
          earlyMorning: row.earlyMorning,
          evening: row.evening,
        },
      })
    );
    return this.prisma.$transaction(ops);
  }

  // ---------------- Tab 3/5: Local Limits + Charges ---------------------------
  async listLocal(vendorId: number) {
    const [limits, charges] = await this.prisma.$transaction([
      this.prisma.vendorLocalLimit.findMany({ where: { vendorId } }),
      this.prisma.vendorLocalCharge.findMany({ where: { vendorId } }),
    ]);
    return { limits, charges };
  }

  async replaceLocalLimits(vendorId: number, dto: UpsertLocalLimitsDto) {
    await this.prisma.vendorLocalLimit.deleteMany({ where: { vendorId } });
    if (!dto.rows.length) return [];
    const ops = dto.rows.map((row) =>
      this.prisma.vendorLocalLimit.create({
        data: { vendorId, vehicleTypeId: row.vehicleTypeId, title: row.title, hours: row.hours, km: row.km },
      })
    );
    return this.prisma.$transaction(ops);
  }

  async upsertLocalCharges(vendorId: number, dto: UpsertLocalChargesDto) {
    const ops = dto.rows.map((row) => {
      const s = row.startDate ? new Date(row.startDate) : null;
      const e = row.endDate ? new Date(row.endDate) : null;
      const rangeKey = makeRangeKey(s, e);
      return this.prisma.vendorLocalCharge.upsert({
        where: { vendorId_vehicleTypeId_rangeKey: { vendorId, vehicleTypeId: row.vehicleTypeId, rangeKey } },
        update: { amount: row.amount, startDate: s, endDate: e },
        create: { vendorId, vehicleTypeId: row.vehicleTypeId, rangeKey, startDate: s, endDate: e, amount: row.amount },
      });
    });
    return this.prisma.$transaction(ops);
  }

  // ---------------- Tab 3/5: Outstation Limits + Charges ----------------------
  async listOutstation(vendorId: number) {
    const [limits, charges] = await this.prisma.$transaction([
      this.prisma.vendorOutstationLimit.findMany({ where: { vendorId } }),
      this.prisma.vendorOutstationCharge.findMany({ where: { vendorId } }),
    ]);
    return { limits, charges };
  }

  async replaceOutstationLimits(vendorId: number, dto: UpsertOutstationLimitsDto) {
    await this.prisma.vendorOutstationLimit.deleteMany({ where: { vendorId } });
    const ops = dto.rows.map((row) =>
      this.prisma.vendorOutstationLimit.create({
        data: { vendorId, vehicleTypeId: row.vehicleTypeId, title: row.title, km: row.km },
      })
    );
    return this.prisma.$transaction(ops);
  }

  async upsertOutstationCharges(vendorId: number, dto: UpsertOutstationChargesDto) {
    const ops = dto.rows.map((row) => {
      const s = row.startDate ? new Date(row.startDate) : null;
      const e = row.endDate ? new Date(row.endDate) : null;
      const rangeKey = makeRangeKey(s, e);
      return this.prisma.vendorOutstationCharge.upsert({
        where: { vendorId_vehicleTypeId_rangeKey: { vendorId, vehicleTypeId: row.vehicleTypeId, rangeKey } },
        update: { amount: row.amount, startDate: s, endDate: e },
        create: { vendorId, vehicleTypeId: row.vehicleTypeId, rangeKey, startDate: s, endDate: e, amount: row.amount },
      });
    });
    return this.prisma.$transaction(ops);
  }

  // === ADD (below “// Tab 5: Extra Costs” upsert) ===
async listExtraCosts(vendorId: number) {
  return this.prisma.vendorVehicleExtraCost.findMany({
    where: { vendorId },
    orderBy: { vehicleTypeId: 'asc' },
  });
}

// === ADD (somewhere near createVendor/updateVendor) ===
async updateVendorMargin(
  id: number,
  data: { vendorMarginPercent?: number | string; vendorMarginGstType?: 'Included' | 'Excluded' | null; vendorMarginGstPct?: number | string }
) {
  return this.prisma.vendor.update({
    where: { id },
    data: {
      vendorMarginPercent: data.vendorMarginPercent != null ? Number(data.vendorMarginPercent) : null,
      vendorMarginGstType: (data.vendorMarginGstType ?? null) as any,
      vendorMarginGstPct: parsePct(data.vendorMarginGstPct),
    },
    select: { id: true, vendorMarginPercent: true, vendorMarginGstType: true, vendorMarginGstPct: true },
  });
}

  // ---------------- Tab 6: Permit Matrix --------------------------------------
  async listPermitCosts(vendorId: number) {
    return this.prisma.vendorPermitCost.findMany({
      where: { vendorId },
      orderBy: [{ vehicleTypeId: 'asc' }],
    });
  }

  async listVehicleTypes() {
    return this.prisma.vehicleType.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
  }

  async upsertPermitCosts(vendorId: number, dto: UpsertPermitCostsDto) {
    const ops: Prisma.PrismaPromise<any>[] = [];
    for (const row of dto.rows) {
      for (const [dest, amt] of Object.entries(row.costs || {})) {
        ops.push(
          this.prisma.vendorPermitCost.upsert({
            where: {
              vendorId_vehicleTypeId_sourceState_destState: {
                vendorId,
                vehicleTypeId: row.vehicleTypeId,
                sourceState: row.sourceState,
                destState: dest,
              },
            },
            update: { amount: Number(amt) },
            create: {
              vendorId,
              vehicleTypeId: row.vehicleTypeId,
              sourceState: row.sourceState,
              destState: dest,
              amount: Number(amt),
            },
          })
        );
      }
    }
    return this.prisma.$transaction(ops);
  }

  // ====================== Vehicles CRUD =======================================
  async listVendorVehicles(vendorId: number) {
    return this.prisma.vehicle.findMany({
      where: { vendorId },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        chassisNumber: true,
        registrationNumber: true,
        vehicleExpiryDate: true,
        lastServicedDate: true,
        extraKmCharge: true,
        earlyMorningCharges: true,
        eveningCharges: true,
        videoUrl: true,
        image: true,
        additional_images: true,
        insurancePolicyNumber: true,
        insuranceStartDate: true,
        insuranceEndDate: true,
        insuranceContactNumber: true,
        rtoCode: true,
        driverOwnerId: true,
        vehicleTypeId: true,
      },
    });
  }

  async createVehicleForVendor(vendorId: number, dto: CreateVehicleLiteDto, files?: VehicleFiles) {
  const exists = await this.prisma.vehicle.findUnique({
    where: { registrationNumber: dto.registrationNumber },
    select: { id: true },
  });
  if (exists) throw new ConflictException(`Vehicle with registration "${dto.registrationNumber}" already exists`);

  // uploaded file paths
  const mainImage = files?.image ? toRel(files.image.path) : null;
  const galleryOnly = (files?.gallery ?? []).map((f) => toRel(f.path)).filter(Boolean);

  // store everything in additional_images as string[]
  const allPaths: string[] = Array.from(new Set([ ...(mainImage ? [mainImage] : []), ...galleryOnly ]));

  return this.prisma.vehicle.create({
    data: {
      chassisNumber: dto.chassisNumber ?? null,
      registrationNumber: dto.registrationNumber,

      vehicleExpiryDate: dto.vehicleExpiryDate ? new Date(dto.vehicleExpiryDate) : null,
      lastServicedDate: dto.lastServicedDate ? new Date(dto.lastServicedDate) : null,

      // ✅ numeric coercion (fallback to 0 for create)
      extraKmCharge: toNumU(dto.extraKmCharge) ?? 0,
      earlyMorningCharges: toNumU(dto.earlyMorningCharges) ?? 0,
      eveningCharges: toNumU(dto.eveningCharges) ?? 0,

      videoUrl: dto.videoUrl ?? null,

      // ✅ ensure Int
      vehicleTypeId: (toNumU(dto.vehicleTypeId) ?? 1) as number,

      vendorId,

      // schema requires non-null string; keep also in additional_images
      image: mainImage ?? '',

      // string[] JSON
      additional_images: allPaths as any,

      insurancePolicyNumber: dto.insurancePolicyNumber ?? null,
      insuranceStartDate: dto.insuranceStartDate ? new Date(dto.insuranceStartDate) : null,
      insuranceEndDate: dto.insuranceEndDate ? new Date(dto.insuranceEndDate) : null,
      insuranceContactNumber: dto.insuranceContactNumber ?? null,
      rtoCode: dto.rtoCode ?? null,

      // ✅ optional Int
      driverOwnerId: (toNumU(dto.driverOwnerId) ?? null) as number | null,
    } as Prisma.VehicleUncheckedCreateInput,
    select: { id: true },
  });
}

  async updateVehicleForVendor(
  vendorId: number,
  vehicleId: number,
  dto: CreateVehicleLiteDto,
  files?: VehicleFiles
) {
  const current = await this.prisma.vehicle.findFirst({
    where: { id: vehicleId, vendorId },
    select: { id: true, additional_images: true, image: true },
  });
  if (!current) throw new NotFoundException('Vehicle not found for this vendor');

  // new uploaded paths
  const newImagePath = files?.image?.path ? toRel(files.image.path) : null;
  const newGallery = (files?.gallery ?? []).map((f) => toRel(f.path)).filter(Boolean);
  const incoming = Array.from(new Set([ ...(newImagePath ? [newImagePath] : []), ...newGallery ]));
  const mergedAdditional = incoming.length ? incoming : undefined; // replace only when new files exist

  const patch: Prisma.VehicleUncheckedUpdateInput = {
    ...(dto.chassisNumber !== undefined ? { chassisNumber: dto.chassisNumber ?? null } : {}),
    ...(dto.registrationNumber !== undefined ? { registrationNumber: dto.registrationNumber } : {}),

    ...(dto.vehicleExpiryDate !== undefined
      ? { vehicleExpiryDate: dto.vehicleExpiryDate ? new Date(dto.vehicleExpiryDate) : null }
      : {}),
    ...(dto.lastServicedDate !== undefined
      ? { lastServicedDate: dto.lastServicedDate ? new Date(dto.lastServicedDate) : null }
      : {}),

    // ✅ numeric coercion (let null clear, undefined skip)
    ...(dto.extraKmCharge !== undefined ? { extraKmCharge: toNumU(dto.extraKmCharge) } : {}),
    ...(dto.earlyMorningCharges !== undefined ? { earlyMorningCharges: toNumU(dto.earlyMorningCharges) } : {}),
    ...(dto.eveningCharges !== undefined ? { eveningCharges: toNumU(dto.eveningCharges) } : {}),

    ...(dto.videoUrl !== undefined ? { videoUrl: dto.videoUrl ?? null } : {}),

    // ✅ ensure Int when provided
    ...(dto.vehicleTypeId !== undefined ? { vehicleTypeId: (toNumU(dto.vehicleTypeId) as number | null) ?? undefined } : {}),

    ...(dto.insurancePolicyNumber !== undefined ? { insurancePolicyNumber: dto.insurancePolicyNumber ?? null } : {}),
    ...(dto.insuranceStartDate !== undefined
      ? { insuranceStartDate: dto.insuranceStartDate ? new Date(dto.insuranceStartDate) : null }
      : {}),
    ...(dto.insuranceEndDate !== undefined
      ? { insuranceEndDate: dto.insuranceEndDate ? new Date(dto.insuranceEndDate) : null }
      : {}),
    ...(dto.insuranceContactNumber !== undefined ? { insuranceContactNumber: dto.insuranceContactNumber ?? null } : {}),
    ...(dto.rtoCode !== undefined ? { rtoCode: dto.rtoCode ?? null } : {}),

    // ✅ optional Int
    ...(dto.driverOwnerId !== undefined
      ? { driverOwnerId: (toNumU(dto.driverOwnerId) as number | null) ?? null }
      : {}),

    // update image if new one uploaded
    ...(newImagePath ? { image: newImagePath } : {}),

    // replace additional_images only when we actually received new files
    ...(mergedAdditional ? { additional_images: mergedAdditional as any } : {}),
  };

  await this.prisma.vehicle.update({
    where: { id: vehicleId },
    data: patch,
  });

  return { ok: true };
}

  async deleteVehicleForVendor(vendorId: number, vehicleId: number) {
    const current = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, vendorId },
      select: { id: true },
    });
    if (!current) throw new NotFoundException('Vehicle not found for this vendor');

    const tripCount = await this.prisma.trip.count({ where: { vehicleId } });
    if (tripCount > 0) throw new ConflictException('Cannot delete vehicle linked to trips.');

    await this.prisma.vehicle.delete({ where: { id: vehicleId } });
    return { ok: true, id: vehicleId };
  }
}
