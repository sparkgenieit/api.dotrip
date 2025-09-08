// src/vehicles/dto/create-vehicle.dto.ts
import { IsInt, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class CreateVehicleDto {
  @IsString() name: string;
  @IsString() model: string;

  // If you're uploading via Multer, keep this optional or remove; your service will map files.
  @IsOptional() @IsString() image?: string;

  @Type(() => Number) @IsInt() capacity: number;
  @IsString() registrationNumber: string;

  @IsOptional() @Type(() => Number) @IsInt() price?: number;
  @IsOptional() @Type(() => Number) @IsInt() originalPrice?: number;


  @IsString() status: string;
  @Type(() => Number) @IsInt() comfortLevel: number;

  @IsOptional() @IsDateString() lastServicedDate?: string;

  @Type(() => Number) @IsInt() vehicleTypeId: number;

  @IsOptional() @Type(() => Number) vendorId?: number;
  @IsOptional() @Type(() => Number) driverOwnerId?: number;

  @IsOptional() @IsEnum(Role) createdBy?: Role;

  // ── Insurance & FC (NEW) ───────────────────────────────────────────
  @IsOptional() @IsString()     insurancePolicyNumber?: string;
  @IsOptional() @IsString()     insuranceContactNumber?: string;
  @IsOptional() @IsString()     rtoCode?: string;

  // Accept "YYYY-MM-DD" (date input) or "DD-MM-YYYY" (your screenshot)
  @IsOptional() @IsString()     insuranceStartDate?: string;
  @IsOptional() @IsString()     insuranceEndDate?: string;
  // ───────────────────────────────────────────────────────────────────
}
