import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

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
    // Optional: extend DTO expectations here if not already present
    priceId?: number;
    priceSpec?: { priceType: string; price: number }; // for nested create
  },
  current: {
    userId?: number;
    role: string;
    vendorId?: number;
    driverId?: number;
  }
) {
  const data: any = {
    name: dto.name,
    model: dto.model,
    image: dto.image,
    capacity: dto.capacity,
    // keep your scalar fields (these are on Vehicle)
    price: dto.priceSpec?.price ?? dto.price ?? 0,
    originalPrice:
    dto.priceSpec?.originalPrice ??
    dto.priceSpec?.price ??
    dto.originalPrice ??
    dto.price ??
    0,
    registrationNumber: dto.registrationNumber,
    vehicleTypeId: dto.vehicleTypeId,
    status: dto.status ?? "available",
    comfortLevel: dto.comfortLevel ?? 3,
    lastServicedDate: dto.lastServicedDate
      ? new Date(dto.lastServicedDate)
      : undefined,
    createdBy: current.role,
  };

  // Owner (Vendor or Driver)
  if (current.role === "VENDOR" && current.vendorId) {
    data.vendorId = current.vendorId;
  } else if (current.role === "DRIVER" && current.driverId) {
    data.driverOwnerId = current.driverId;
  } else if (dto.vendorId) {
    data.vendorId = dto.vendorId;
  }

  // ── PRICE RELATION HANDLING (matches your schema) ───────────────────────────
  // Your schema has: priceId Int @default(10), vehiclePrice Price @relation(...)
  // Avoid FK violation by EITHER connecting a valid priceId OR creating one.
 // ── PRICE RELATION HANDLING (Vehicle has priceId FK; no `vehiclePrice` relation field) ──
let priceId: number | null = null;

if (dto.priceId) {
  const exists = await this.prisma.price.findUnique({
    where: { id: dto.priceId },
    select: { id: true },
  });
  if (!exists) throw new NotFoundException(`Price with ID ${dto.priceId} not found`);
  priceId = dto.priceId;
} else if (dto.priceSpec) {
  // Create a Price row first, then attach via priceId
  const created = await this.prisma.price.create({
    data: {
      priceType: dto.priceSpec.priceType ?? 'BASE',
      // Use your actual Price model fields. If your model uses `amount`, map accordingly.
      price: dto.priceSpec.price,
    },
    select: { id: true },
  });
  priceId = created.id;
} else {
  // Fallback to default if it exists
  const defaultId = 10;
  const defaultExists = await this.prisma.price.findUnique({
    where: { id: defaultId },
    select: { id: true },
  });
  if (!defaultExists) {
    throw new NotFoundException(
      `No price provided and default priceId=${defaultId} does not exist. Provide { priceId } or { priceSpec: { priceType, price } } or create a Price row with id=${defaultId}.`
    );
  }
  priceId = defaultId;
}

// attach FK (only if we actually have one)
if (priceId) data.priceId = priceId;


return this.prisma.vehicle.create({
  data,
  include: {
    // no `vehiclePrice` here; use the actual relation name if you have one (e.g., `price`)
    vendor: true,
    driver: true,
    vehicleType: true,
  },
});
}

async update(id: number, dto: UpdateVehicleDto) {
  // Pull out fields needing special handling; keep rest as-is
  const {
    vendorId,
    vehicleTypeId,
    lastServicedDate,
    priceSpec,     // ❌ not a Vehicle column (we'll map it)
    image,         // may arrive as string or string[]
    ...rest
  } = dto as any;

  const data: any = {
    ...rest, // safe fields like name, model, status, price, originalPrice, capacity, comfortLevel, etc.
  };

  // ✅ image is a single String in schema
  if (typeof image !== 'undefined') {
    data.image = Array.isArray(image) ? (image[0] ?? '') : image;
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
  if (priceSpec) {
    if (typeof priceSpec.price === 'number') data.price = priceSpec.price;
    if (typeof priceSpec.originalPrice === 'number') data.originalPrice = priceSpec.originalPrice;
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
