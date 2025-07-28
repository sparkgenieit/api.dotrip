// src/drivers/dto/update-driver.dto.ts
import { IsOptional, IsString, IsBoolean, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPartTime?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendorId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedVehicleId?: number;

  @IsOptional()
  @IsString()
  licenseImage?: string;

  @IsOptional()
  @IsString()
  rcImage?: string;
}
