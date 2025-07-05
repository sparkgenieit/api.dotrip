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
  isPartTime?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsInt()
  vendorId?: number;

  @IsOptional()
  @IsInt()
  vehicleId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;
}
