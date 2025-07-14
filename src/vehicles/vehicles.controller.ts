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

@Controller("vehicles")
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles("ADMIN", "VENDOR", "DRIVER")
  create(@Body() createVehicleDto: CreateVehicleDto, @Req() req: AuthRequest) {
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
  getAvailableVehicles(@Query("typeId") typeId: string) {
    const parsedId = parseInt(typeId);
    if (isNaN(parsedId)) {
      throw new BadRequestException("Invalid vehicle typeId");
    }
    return this.vehiclesService.findAvailableByType(parsedId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(+id, updateVehicleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.vehiclesService.remove(+id);
  }
}
