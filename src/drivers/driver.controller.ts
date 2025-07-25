import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  Patch,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../types/auth-request';
import { UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { join } from 'path';
import { Express } from 'express';
import { File as MulterFile } from 'multer';


const multerDriverStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'drivers');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'licenseImage', maxCount: 1 },
        { name: 'rcImage', maxCount: 1 },
      ],
      { storage: multerDriverStorage },
    ),
  )
  async create(
    @UploadedFiles()
    files: {
        licenseImage?: MulterFile[];
        rcImage?: MulterFile[];
    },
    @Body() dto: CreateDriverDto,
    @Req() req: AuthRequest,
  ) {
    if (files.licenseImage?.[0]) {
      dto.licenseImage = `uploads/drivers/${files.licenseImage[0].filename}`;
    }
    if (files.rcImage?.[0]) {
      dto.rcImage = `uploads/drivers/${files.rcImage[0].filename}`;
    }

    return this.driverService.createDriverByRole(dto, req.user);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.driverService.findDriversByRole(req.user);
  }

  @Get('/available')
  getAvailableDrivers() {
    return this.driverService.getAvailableDrivers();
  }

  @Patch('/assign')
  assignDriverToVehicle(
    @Body('driverId') driverId: number,
    @Body('vehicleId') vehicleId: number,
  ) {
    if (!driverId || !vehicleId) {
      throw new NotFoundException('Driver ID and Vehicle ID required');
    }
    return this.driverService.assignDriverToVehicle(driverId, vehicleId);
  }

  @Patch(':id')
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'licenseImage', maxCount: 1 },
      { name: 'rcImage', maxCount: 1 },
    ],
    { storage: multerDriverStorage },
  ),
)
async updateMultipart(
  @Param('id') id: string,
  @UploadedFiles()
  files: {
    licenseImage?: MulterFile[];
    rcImage?: MulterFile[];
  },
  @Body() dto: UpdateDriverDto,
  @Req() req: AuthRequest,
) {
  if (files.licenseImage?.[0]) {
    dto.licenseImage = `uploads/drivers/${files.licenseImage[0].filename}`;
  }
  if (files.rcImage?.[0]) {
    dto.rcImage = `uploads/drivers/${files.rcImage[0].filename}`;
  }

  return this.driverService.update(+id, dto);
}


  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.driverService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driverService.remove(+id);
  }
}
