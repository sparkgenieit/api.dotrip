// src/vehicles/vehicles.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard"; // ✅ Fixed import path
import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: number;
    vendorId?: number;
    driverId?: number;
    role: string;
  };
}

@Controller("vehicles")
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() dto: CreateVehicleDto, @Req() req: AuthenticatedRequest) {
    return this.vehiclesService.create(dto, req.user!);
  }

  @Get()
  findAll(@Query() filters: { vendorId?: number }) {
    return this.vehiclesService.findAll(filters);
  }
  @Get("available")
  @UseGuards(JwtAuthGuard)
  findAvailable(@Query("typeId") typeId: string) {
    return this.vehiclesService.findAvailableByType(Number(typeId));
  }
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.vehiclesService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(+id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.vehiclesService.remove(+id);
  }
}
