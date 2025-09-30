import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { VehicleTypesService } from './vehicle-types.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { join, extname } from 'path';

// Multer storage (same pattern as Vehicles, different folder)
const multerVehicleTypeStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'vehicle-types');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (_req, file: Express.Multer.File, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const base = safe.replace(/\.[^.]+$/, '');
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}_${base}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

@Controller('vehicle-types')
export class VehicleTypesController {
  constructor(private readonly service: VehicleTypesService) {}

  // PUBLIC LIST
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // PROTECTED GET BY ID
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'VENDOR', 'DRIVER')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // PROTECTED CREATE (inline single image upload; field name: "image")
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // adjust if vendors should manage types
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
      storage: multerVehicleTypeStorage,
    }),
  )
  create(
    @Body() body: any,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
    },
  ) {
    if (files?.image?.[0]) {
      body.image = `uploads/vehicle-types/${files.image[0].filename}`; // schema: String path
    } else {
      // allow passing a URL/path via form field as fallback
      body.image = body.image || body.imageUrl || body.image_url;
    }
    return this.service.create(body);
  }

  // PROTECTED UPDATE (inline single image upload; only replace if provided)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // adjust if needed
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
      storage: multerVehicleTypeStorage,
    }),
  )
  update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
    },
  ) {
    if (files?.image?.[0]) {
      body.image = `uploads/vehicle-types/${files.image[0].filename}`;
    } else if (body.image || body.imageUrl || body.image_url) {
      body.image = body.image || body.imageUrl || body.image_url;
    }
    return this.service.update(+id, body);
  }

  // PROTECTED DELETE
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
