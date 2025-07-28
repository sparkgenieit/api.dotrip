import { Express } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { AuthRequest } from "../types/auth-request";
import { UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { join } from 'path';

  const multerVehicleStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'vehicles');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

@Controller("vehicles")
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

@Post()
@Roles("ADMIN", "VENDOR", "DRIVER")
@UseInterceptors(
  FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], {
    storage: multerVehicleStorage,
  }),
)
create(
  @Body() createVehicleDto: CreateVehicleDto,
  @Req() req: AuthRequest,
  @UploadedFiles()
files: {
    images?: any[];
  },
) {
  if (files?.images?.length) {
    createVehicleDto.image = files.images.map(file => `uploads/vehicles/${file.filename}`);
  }

  return this.vehiclesService.create(createVehicleDto, req.user);
}


  @Get()
  @Roles("ADMIN", "VENDOR", "DRIVER")
  findAll(@Req() req: AuthRequest) {
    const { role, vendorId, driverId } = req.user;

    if (role === "VENDOR" && vendorId) {
      return this.vehiclesService.findAll({ vendorId });
    }

    if (role === "DRIVER" && driverId) {
      return this.vehiclesService.findAll({ driverOwnerId: driverId });
    }

    // ADMIN or fallback – return all
    return this.vehiclesService.findAll({});
  }

  @Get("available")
  @Roles("ADMIN", "VENDOR")
 getAvailableVehicles(
  @Req() req: AuthRequest,
  @Query('typeId') typeId: string,
) {
  const vendorUserId = req.user.id;
  return this.vehiclesService.getAvailableVehicles(+typeId, vendorUserId); // ✅ fixed name
}

@Patch(":id")
@UseInterceptors(
  FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], {
    storage: multerVehicleStorage,
  }),
)
update(
  @Param("id") id: string,
  @Body() updateVehicleDto: UpdateVehicleDto,
  @UploadedFiles()
files: {
    images?: any[];
  },
) {
  if (files?.images?.length) {
    updateVehicleDto.image = files.images.map(file => `uploads/vehicles/${file.filename}`);
  }

  return this.vehiclesService.update(+id, updateVehicleDto);
}


  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.vehiclesService.remove(+id);
  }

}
