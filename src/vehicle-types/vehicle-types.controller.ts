import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { VehicleTypesService } from './vehicle-types.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { File as MulterFile } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import type { Request } from 'express';



@Controller('vehicle-types')
export class VehicleTypesController {
  constructor(private readonly service: VehicleTypesService) {}

  // LIST
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ✅ GET BY ID  -> fixes "Cannot GET /vehicle-types/:id"
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

// CREATE (inline image upload)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'vehicle-types');
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  create(@Body() body: any, @UploadedFile() file?: MulterFile) {
    if (file) {
      // Save relative path; adjust to your DTO field as needed
      const relPath = `uploads/vehicle-types/${file.filename}`;
      body.image = relPath;
      body.imageUrl = relPath;   // keep both for compatibility
      body.image_url = relPath;
    }
    return this.service.create(body);
  }

  // UPDATE (inline image upload; only overwrite if provided)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'vehicle-types');
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: MulterFile,
  ) {
    if (file) {
      const relPath = `uploads/vehicle-types/${file.filename}`;
      body.image = relPath;
      body.imageUrl = relPath;
      body.image_url = relPath;
    }
    return this.service.update(id, body);
  }

  // DELETE
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post('upload')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = join(process.cwd(), 'uploads', 'vehicle-types');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      // accept images only
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }),
)
upload(@UploadedFile() file: MulterFile, @Req() req: Request) {
  const base = `${req.protocol}://${req.get('host')}`;
  return { url: `${base}/uploads/vehicle-types/${file.filename}` };
}
}

