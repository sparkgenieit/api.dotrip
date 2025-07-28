import { Transform } from 'class-transformer';
import { IsString, IsInt, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  licenseNumber: string;

  @IsDateString()
  licenseExpiry: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true') // ✅ Fix for FormData string
  isPartTime?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true') // ✅ Fix for FormData string
  isAvailable?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  vendorId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  vehicleId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsString()
  licenseImage?: string;

  @IsOptional()
  @IsString()
  rcImage?: string;

}
