import {
  Controller,
  Patch,
  Put,
  Get,
  Post,
  Delete, // ← add this
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';

import { DriversService } from './driver.service';

// DTOs
import { UpdateDriverBasicDto } from './dto/update-driver-basic.dto';
import { UpdateDriverCostDto } from './dto/update-driver-cost.dto';
import { UpdateDriverDocsDto } from './dto/update-driver-docs.dto';
import { UpdateDriverFeedbackDto } from './dto/update-driver-feedback.dto';
import { CreateDriverBasicDto } from './dto/create-driver-basic.dto';

// ---------- Upload helpers ----------
const UPLOAD_ROOT_DRIVERS = join(process.cwd(), 'uploads', 'drivers');
const UPLOAD_ROOT_DOCS = join(UPLOAD_ROOT_DRIVERS, 'docs');
if (!fs.existsSync(UPLOAD_ROOT_DRIVERS)) fs.mkdirSync(UPLOAD_ROOT_DRIVERS, { recursive: true });
if (!fs.existsSync(UPLOAD_ROOT_DOCS)) fs.mkdirSync(UPLOAD_ROOT_DOCS, { recursive: true });

function safeUploadName(original: string) {
  const cleaned = original.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  return `${uuid()}_${cleaned}`;
}

const storageBasic = diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT_DRIVERS),
  filename: (_req, file, cb) => cb(null, safeUploadName(file.originalname)),
});

const storageDocs = diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT_DOCS),
  filename: (_req, file, cb) => cb(null, safeUploadName(file.originalname)),
});

// ---------- Controller ----------
@Controller('drivers')
export class DriversController {
  constructor(private readonly drivers: DriversService) {}

  /**
   * LIST — GET /drivers?page=1&pageSize=10&q=ramu&vendorId=1&available=true
   */
  @Get()
  async listDrivers(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('q') q?: string,
    @Query('vendorId') vendorId?: string,
    @Query('available') available?: string,
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const ps = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 10));
    const vendorIdNum = vendorId ? Number(vendorId) : undefined;
    const availableBool =
      available === 'true' ? true : available === 'false' ? false : undefined;

    return this.drivers.listDrivers({
      page: p,
      pageSize: ps,
      q,
      vendorId: vendorIdNum,
      available: availableBool,
    });
  }

  /**
   * CREATE (Basic tab first submit)
   * Path: POST /drivers
   */
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }], { storage: storageBasic }),
  )
  async createBasic(
    @UploadedFiles() files: { profileImage?: Express.Multer.File[] },
    @Body() dto: CreateDriverBasicDto,
  ) {
    const profile = files?.profileImage?.[0];
    return this.drivers.createBasic(dto, profile);
  }

  @Put(':id/assign-vehicle')
    async assignVehicle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { vehicleId: number | null },
    ) {
    const exists = await this.drivers.ensureDriver(id);
    if (!exists) throw new NotFoundException('Driver not found');

    return this.drivers.assignVehicle(id, body?.vehicleId ?? null);
    }

  /**
   * BASIC TAB — Update & Continue
   * Path: PATCH /drivers/:id/basic
   */
  @Patch(':id/basic')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }], { storage: storageBasic }),
  )
  async updateBasic(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: { profileImage?: Express.Multer.File[] },
    @Body() dto: UpdateDriverBasicDto,
  ) {
    const exists = await this.drivers.ensureDriver(id);
    if (!exists) throw new NotFoundException('Driver not found');

    const profile = files?.profileImage?.[0];
    return this.drivers.updateBasic(id, dto, profile);
  }

  /**
   * COST DETAILS TAB — Upsert
   * Path: PUT /drivers/:id/cost
   */
  @Put(':id/cost')
  async upsertCost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDriverCostDto,
  ) {
    const exists = await this.drivers.ensureDriver(id);
    if (!exists) throw new NotFoundException('Driver not found');

    return this.drivers.upsertCostDetails(id, dto);
  }

  /**
   * DOCUMENTS TAB — Upload & Upsert
   * Path: PATCH /drivers/:id/docs
   */
  @Patch(':id/docs')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'aadhar', maxCount: 1 },
        { name: 'pan', maxCount: 1 },
        { name: 'voter', maxCount: 1 },
        { name: 'license', maxCount: 1 },
      ],
      { storage: storageDocs },
    ),
  )
  async upsertDocs(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      aadhar?: Express.Multer.File[];
      pan?: Express.Multer.File[];
      voter?: Express.Multer.File[];
      license?: Express.Multer.File[];
    },
    @Body() _dto: UpdateDriverDocsDto,
  ) {
    const exists = await this.drivers.ensureDriver(id);
    if (!exists) throw new NotFoundException('Driver not found');

    return this.drivers.upsertDocuments(id, {
      aadhar: files?.aadhar?.[0],
      pan: files?.pan?.[0],
      voter: files?.voter?.[0],
      license: files?.license?.[0],
    });
  }

  /**
   * FEEDBACK / REVIEW TAB — Upsert
   * Path: PUT /drivers/:id/feedback
   */
  @Put(':id/feedback')
  async upsertFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDriverFeedbackDto,
  ) {
    const exists = await this.drivers.ensureDriver(id);
    if (!exists) throw new NotFoundException('Driver not found');

    return this.drivers.upsertFeedback(id, dto);
  }

  /**
   * Utility: fetch everything needed for Edit / Preview
   * Path: GET /drivers/:id/full
   */
  @Get(':id/full')
  async getDriverFull(@Param('id', ParseIntPipe) id: number) {
    const exists = await this.drivers.ensureDriver(id);
    if (!exists) throw new NotFoundException('Driver not found');
    return this.drivers.getDriverFull(id);
  }

    @Delete(':id')
  async removeDriver(@Param('id', ParseIntPipe) id: number) {
    const exists = await this.drivers.ensureDriver(id);
    if (!exists) throw new NotFoundException('Driver not found');
    return this.drivers.deleteDriver(id);
  }

  /**
   * Quick ping for debugging route mapping
   * Path: GET /drivers/ping
   */
  @Get('ping')
  ping() {
    return { ok: true, controller: 'drivers' };
  }
}
