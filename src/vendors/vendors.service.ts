// === FILE: src/vendors/vendors.service.ts =====================================
import { Injectable } from '@nestjs/common';
import { Prisma, Vendor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateVendorDto, UpdateVendorDto, UpsertBranchesDto,
  UpsertDriverCostsDto, UpsertExtraCostsDto, UpsertLocalLimitsDto, UpsertLocalChargesDto,
  UpsertOutstationLimitsDto, UpsertOutstationChargesDto, UpsertPermitCostsDto,
} from './dto/vendor.dto';

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

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  // ---------------- Tab 1: Basic Info -----------------------------------------
  async createVendor(data: CreateVendorDto): Promise<Vendor> {
    return this.prisma.vendor.create({
      data: {
        name: data.name,
        companyReg: `VND-${Date.now()}`, // placeholder if you don't capture it in UI
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
      },
    });
  }

  async updateVendor(id: number, data: UpdateVendorDto): Promise<Vendor> {
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
    // Replace strategy: delete removed ones then upsert provided
    const keepIds = dto.branches.filter(b => !!b.id).map(b => Number(b.id));
    await this.prisma.vendorBranch.deleteMany({
      where: { vendorId, ...(keepIds.length ? { id: { notIn: keepIds } } : {}) },
    });

    const ops = dto.branches.map((b) => {
      const gstPct = parsePct(b.gstPercent, null);
      return this.prisma.vendorBranch.upsert({
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
          gstPercent: gstPct,
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
          gstPercent: gstPct,
          address: b.address,
        },
      });
    });
    return this.prisma.$transaction(ops);
  }

  // ---------------- Tab 3/5: Driver Cost --------------------------------------
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
      this.prisma.vendorLocalLimit.findMany({ where: { vendorId }, orderBy: [{ vehicleTypeId: 'asc' }, { id: 'asc' }] }),
      this.prisma.vendorLocalCharge.findMany({ where: { vendorId }, orderBy: [{ vehicleTypeId: 'asc' }, { id: 'asc' }] }),
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
      this.prisma.vendorOutstationLimit.findMany({ where: { vendorId }, orderBy: [{ vehicleTypeId: 'asc' }, { id: 'asc' }] }),
      this.prisma.vendorOutstationCharge.findMany({ where: { vendorId }, orderBy: [{ vehicleTypeId: 'asc' }, { id: 'asc' }] }),
    ]);
    return { limits, charges };
  }

  async replaceOutstationLimits(vendorId: number, dto: UpsertOutstationLimitsDto) {
    await this.prisma.vendorOutstationLimit.deleteMany({ where: { vendorId } });
    if (!dto.rows.length) return [];
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

  // ---------------- Tab 6: Permit Matrix --------------------------------------
  async listPermitCosts(vendorId: number) {
    return this.prisma.vendorPermitCost.findMany({
      where: { vendorId },
      orderBy: [{ vehicleTypeId: 'asc' }, { sourceState: 'asc' }, { destState: 'asc' }],
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
        const amount = Number(String(amt).replace(/[^\d.]/g, '')) || 0;
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
            update: { amount },
            create: { vendorId, vehicleTypeId: row.vehicleTypeId, sourceState: row.sourceState, destState: dest, amount },
          })
        );
      }
    }
    return this.prisma.$transaction(ops);
  }
}
