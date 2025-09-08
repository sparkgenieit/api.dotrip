import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

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
  dto: CreateVehicleDto & {
    priceId?: number;
    priceSpec?: { priceType: string; price: number; originalPrice?: number };
  },
  current: {
    userId?: number;
    role: string;
    vendorId?: number;
    driverId?: number;
  }
) {
  // ✅ Always coerce to a single string (schema expects String, not String[])
const singleImage = Array.isArray(dto.image) ? (dto.image[0] ?? undefined) : dto.image;

// normalize priceSpec and dates
  const rawCreate = dto as any;
  const psCreate =
    rawCreate.priceSpec ??
    (
      (rawCreate['priceSpec[price]'] !== undefined) ||
      (rawCreate['priceSpec[originalPrice]'] !== undefined) ||
      (rawCreate['priceSpec[priceType]'] !== undefined) ||
      (rawCreate['priceSpec[currency]'] !== undefined)
    ? {
        priceType: rawCreate['priceSpec[priceType]'],
        price: rawCreate['priceSpec[price]'] !== undefined ? Number(rawCreate['priceSpec[price]']) : undefined,
        originalPrice: rawCreate['priceSpec[originalPrice]'] !== undefined ? Number(rawCreate['priceSpec[originalPrice]']) : undefined,
        currency: rawCreate['priceSpec[currency]'],
      }
    : undefined
    );
const lastServiceAt = dto.lastServicedDate ? toDateOrNull(dto.lastServicedDate as any) : undefined;

const data: any = {
  name: dto.name,
  model: dto.model,
  image: singleImage, // ✅ normalized string
  capacity: dto.capacity,

  // prices with robust fallbacks
  price: (typeof psCreate?.price === 'number' ? psCreate.price : (dto.price ?? 0)),
  originalPrice: (typeof psCreate?.originalPrice === 'number'
    ? psCreate.originalPrice

    : (typeof psCreate?.price === 'number'
        ? psCreate.price
        : (dto.originalPrice ?? dto.price ?? 0))),


  registrationNumber: dto.registrationNumber,
  vehicleTypeId: dto.vehicleTypeId,
  status: dto.status ?? 'available',
  comfortLevel: dto.comfortLevel ?? 3,

  // unified date parsing
  lastServicedDate: lastServiceAt,

  createdBy: current.role as any,

  // Insurance & FC
  insurancePolicyNumber: dto.insurancePolicyNumber ?? null,
  insuranceContactNumber: dto.insuranceContactNumber ?? null,
  rtoCode: dto.rtoCode ?? null,
  insuranceStartDate: toDateOrNull(dto.insuranceStartDate as any),
  insuranceEndDate: toDateOrNull(dto.insuranceEndDate as any),
};

  // Owner (Vendor or Driver)
  if (current.role === 'VENDOR' && current.vendorId) {
    data.vendorId = current.vendorId;
  } else if (current.role === 'DRIVER' && current.driverId) {
    data.driverOwnerId = current.driverId;
  } else if (dto.vendorId) {
    data.vendorId = dto.vendorId;
  }

  // ── PRICE RELATION HANDLING (Vehicle has priceId FK; no `vehiclePrice` relation field) ──
  let priceId: number;

  // Expand priceSpec even if fields came in as priceSpec[...]
  const raw = dto as any;
  const ps =
    raw.priceSpec ??
    (
      (raw['priceSpec[price]'] !== undefined) ||
      (raw['priceSpec[originalPrice]'] !== undefined) ||
      (raw['priceSpec[priceType]'] !== undefined) ||
      (raw['priceSpec[currency]'] !== undefined)
    ? {
        priceType: raw['priceSpec[priceType]'],
        price: raw['priceSpec[price]'] !== undefined ? Number(raw['priceSpec[price]']) : undefined,
        originalPrice: raw['priceSpec[originalPrice]'] !== undefined ? Number(raw['priceSpec[originalPrice]']) : undefined,
        currency: raw['priceSpec[currency]'],
      }
    : undefined
    );

  if (dto.priceId) {
    // honor an explicit priceId
    const exists = await this.prisma.price.findUnique({
      where: { id: dto.priceId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Price with ID ${dto.priceId} not found`);
    priceId = dto.priceId;
  } else if (ps && typeof ps.price === 'number') {
    // create a Price row from provided spec
    const created = await this.prisma.price.create({
      data: {
        priceType: ps.priceType ?? 'BASE',
        price: ps.price,
      },
      select: { id: true },
    });
    priceId = created.id;
  } else {
    // final fallback: synthesize a BASE price from dto.price or 0
    const base = typeof dto.price === 'number' ? dto.price : 0;
    const created = await this.prisma.price.create({
      data: {
        priceType: 'BASE',
        price: base,
      },
      select: { id: true },
    });
    priceId = created.id;
  }

  data.priceId = priceId;

  return this.prisma.vehicle.create({
    data,
    include: {
      vendor: true,
      driver: true,
      vehicleType: true,
    },
  });
}

// REPLACE this whole block in src/vehicles/vehicles.service.ts  (#realcode)

async update(id: number, dto: UpdateVehicleDto) {
  // Pull out fields needing special handling; keep rest as-is
  const {
    vendorId,
    vehicleTypeId,
    lastServicedDate,
    priceSpec,     // ❌ not a Vehicle column (we'll map it)
    image,         // may arrive as string or string[]

    // ✅ NEW: Insurance & FC fields
    insurancePolicyNumber,
    insuranceStartDate,
    insuranceEndDate,
    insuranceContactNumber,
    rtoCode,

    ...rest
  } = dto as any;

  const data: any = {
    ...rest, // safe fields like name, model, status, price, originalPrice, capacity, comfortLevel, etc.
  };

  // ✅ image is a single String in schema
  if (typeof image !== 'undefined') {
    data.image = Array.isArray(image) ? image[0] : image;
  }

  // ✅ date normalization
  if (lastServicedDate) {
    const d = new Date(lastServicedDate);
    if (!isNaN(d.getTime())) data.lastServicedDate = d;
  }

  // ✅ vendor relation change (connect / disconnect)
  if (typeof vendorId !== 'undefined') {
    if (vendorId) {
      data.vendor = { connect: { id: vendorId } };
    } else {
      data.vendor = { disconnect: true };
    }
  }

  // ✅ vehicleType relation change (use connect, not vehicleTypeId scalar)
  if (typeof vehicleTypeId === 'number') {
    data.vehicleType = { connect: { id: vehicleTypeId } };
  }

  // ✅ map priceSpec (if caller still sends it) into Vehicle scalars
  const raw = dto as any;
  const psUpdate =
    priceSpec ??
    (
      (raw['priceSpec[price]'] !== undefined) ||
      (raw['priceSpec[originalPrice]'] !== undefined) ||
      (raw['priceSpec[priceType]'] !== undefined) ||
      (raw['priceSpec[currency]'] !== undefined)
    ? {
        priceType: raw['priceSpec[priceType]'],
        price: raw['priceSpec[price]'] !== undefined ? Number(raw['priceSpec[price]']) : undefined,
        originalPrice: raw['priceSpec[originalPrice]'] !== undefined ? Number(raw['priceSpec[originalPrice]']) : undefined,
        currency: raw['priceSpec[currency]'],
      }
    : undefined
    );

  if (psUpdate) {
    if (typeof psUpdate.price === 'number') data.price = psUpdate.price;
    if (typeof psUpdate.originalPrice === 'number') data.originalPrice = psUpdate.originalPrice;
  }

  // ✅ NEW: Insurance & FC mapping
  if (typeof insurancePolicyNumber !== 'undefined') {
    data.insurancePolicyNumber = String(insurancePolicyNumber || '').trim() || null;
  }
  if (typeof insuranceContactNumber !== 'undefined') {
    data.insuranceContactNumber = String(insuranceContactNumber || '').trim() || null;
  }
  if (typeof rtoCode !== 'undefined') {
    data.rtoCode = String(rtoCode || '').trim() || null;
  }
  if (typeof insuranceStartDate !== 'undefined') {
    data.insuranceStartDate = toDateOrNull(insuranceStartDate);
  }
  if (typeof insuranceEndDate !== 'undefined') {
    data.insuranceEndDate = toDateOrNull(insuranceEndDate);
  }

  // ❌ ensure forbidden keys never reach Prisma `data`
  delete data.vehicleTypeId;
  delete data.priceSpec;

  return this.prisma.vehicle.update({
    where: { id },
    data,
  });
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