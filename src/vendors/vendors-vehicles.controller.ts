import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { VendorsService } from './vendors.service';
import { CreateVehicleLiteDto, UpdateVehicleLiteDto } from './dto/vendor.dto';
import * as path from 'path';

/* === ADD: turn multer file into a public URL/path === */
function toPublicPath(f?: Express.Multer.File): string | undefined {
  if (!f) return;
  const p = (f as any).path ? (f as any).path : path.posix.join('/uploads', f.filename);
  return '/' + p.replace(/^\/+/, '').replace(/\\/g, '/');
}
// ---------- uploads ----------
const UPLOAD_ROOT_VEH = join(process.cwd(), 'uploads', 'vehicles');
if (!fs.existsSync(UPLOAD_ROOT_VEH)) fs.mkdirSync(UPLOAD_ROOT_VEH, { recursive: true });

function safeUploadName(original: string) {
  const cleaned = original.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  return `${uuid()}_${cleaned}`;
}
const storageVehicles = diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT_VEH),
  filename: (_req, file, cb) => cb(null, safeUploadName(file.originalname)),
});

type VehicleFiles = {
  image?: Express.Multer.File;
  gallery?: Express.Multer.File[];
};

type UploadPathPayload = { galleryPaths?: string[] };

@Controller('vendors/:vendorId/vehicles')
export class VendorsVehiclesController {
  constructor(private readonly vendors: VendorsService) {}

  // ---------------------------------------------------------------------------
  // KEEP: list all vehicles for a vendor
  // GET /vendors/:vendorId/vehicles
  // ---------------------------------------------------------------------------
  @Get()
  list(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.vendors.listVendorVehicles(vendorId);
  }

  // ---------------------------------------------------------------------------
  // NEW: get a single vehicle (handy for edit screens)
  // GET /vendors/:vendorId/vehicles/:vehicleId
  // ---------------------------------------------------------------------------
  @Get(':vehicleId')
  async getOne(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
  ) {
    const rows = await this.vendors.listVendorVehicles(vendorId);
    const hit = rows.find((v) => v.id === vehicleId);
    if (!hit) throw new NotFoundException('Vehicle not found for this vendor');
    return hit;
  }

  // ---------------------------------------------------------------------------
  // KEEP: create (multipart or JSON)
  // POST /vendors/:vendorId/vehicles
  // Accepts: image (single), gallery[] (multiple) + JSON fields
  // ---------------------------------------------------------------------------
 @Post()
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'image', maxCount: 1 },
      { name: 'gallery', maxCount: 12 },
    ],
    { storage: storageVehicles },
  ),
)
async create(
  @Param('vendorId', ParseIntPipe) vendorId: number,
  @UploadedFiles() filesRaw: { image?: Express.Multer.File[]; gallery?: Express.Multer.File[] },
  @Body(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  })) body: CreateVehicleLiteDto,
) {
  // Combine image + gallery into a single list of file paths
  const galleryPaths = [
    ...(filesRaw?.image?.[0] ? [filesRaw.image[0]] : []),
    ...(filesRaw?.gallery ?? []),
  ].map(toPublicPath).filter(Boolean) as string[];

  const base: CreateVehicleLiteDto = {
    chassisNumber: body.chassisNumber ?? null,
    registrationNumber: body.registrationNumber || `TEMP-${uuid().slice(0, 8).toUpperCase()}`,
    vehicleExpiryDate: body.vehicleExpiryDate,
    lastServicedDate: body.lastServicedDate,
    extraKmCharge: body.extraKmCharge ?? 0,
    earlyMorningCharges: body.earlyMorningCharges ?? 0,
    eveningCharges: body.eveningCharges ?? 0,
    videoUrl: body.videoUrl ?? null,
    insurancePolicyNumber: body.insurancePolicyNumber,
    insuranceStartDate: body.insuranceStartDate,
    insuranceEndDate: body.insuranceEndDate,
    insuranceContactNumber: body.insuranceContactNumber,
    rtoCode: body.rtoCode,
    driverOwnerId: body.driverOwnerId ?? null,
    galleryTypes: body.galleryTypes ?? [],
    vehicleTypeId: body.vehicleTypeId ?? 1,
  };

  // Pass only paths; service will store them into additional_images (string[])
  const files: VehicleFiles = { image: filesRaw?.image?.[0], gallery: filesRaw?.gallery ?? [] };
  return this.vendors.createVehicleForVendor(vendorId, base, files);
}

  // ---------------------------------------------------------------------------
  // KEEP: update (multipart or JSON)
  // PATCH /vendors/:vendorId/vehicles/:vehicleId
  // Accepts: image (single), gallery[] (multiple) + JSON fields
  // ---------------------------------------------------------------------------
 @Patch(':vehicleId')
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'image', maxCount: 1 },
      { name: 'gallery', maxCount: 12 },
    ],
    { storage: storageVehicles },
  ),
)
async update(
  @Param('vendorId', ParseIntPipe) vendorId: number,
  @Param('vehicleId', ParseIntPipe) vehicleId: number,
  @UploadedFiles() filesRaw: { image?: Express.Multer.File[]; gallery?: Express.Multer.File[] },
  @Body(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  })) body: UpdateVehicleLiteDto,
) {
  const list = await this.vendors.listVendorVehicles(vendorId);
  if (!list?.find((v) => v.id === vehicleId)) {
    throw new NotFoundException('Vehicle not found for this vendor');
  }

  const galleryPaths = [
    ...(filesRaw?.image?.[0] ? [filesRaw.image[0]] : []),
    ...(filesRaw?.gallery ?? []),
  ].map(toPublicPath).filter(Boolean) as string[];

  const files: VehicleFiles = { image: filesRaw?.image?.[0], gallery: filesRaw?.gallery ?? [] };
return this.vendors.updateVehicleForVendor(vendorId, vehicleId, body, files);
}


  // ---------------------------------------------------------------------------
  // NEW: update without files (JSON-only convenience route, optional)
  // PATCH /vendors/:vendorId/vehicles/:vehicleId/json
  // ---------------------------------------------------------------------------
  @Patch(':vehicleId/json')
  async updateJsonOnly(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() body: UpdateVehicleLiteDto,
  ) {
    const list = await this.vendors.listVendorVehicles(vendorId);
    if (!list?.find((v) => v.id === vehicleId)) {
      throw new NotFoundException('Vehicle not found for this vendor');
    }
    return this.vendors.updateVehicleForVendor(vendorId, vehicleId, body, undefined);
  }

  // ---------------------------------------------------------------------------
  // KEEP: delete
  // DELETE /vendors/:vendorId/vehicles/:vehicleId
  // ---------------------------------------------------------------------------
  @Delete(':vehicleId')
  remove(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
  ) {
    return this.vendors.deleteVehicleForVendor(vendorId, vehicleId);
  }

  // ---------------------------------------------------------------------------
  // NEW: quick health/ping for this controller
  // GET /vendors/:vendorId/vehicles/ping
  // ---------------------------------------------------------------------------
  @Get('ping')
  ping(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return { ok: true, controller: 'vendors-vehicles', vendorId };
  }
}
