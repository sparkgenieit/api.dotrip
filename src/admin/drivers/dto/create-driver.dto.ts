import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEmail,
  IsDateString,
} from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDateString()
  @IsNotEmpty()
  licenseExpiry: string; // Use ISO string format on frontend (e.g., "2025-12-31T00:00:00.000Z")

  @IsOptional()
  @IsNumber()
  userId?: number;

 
  @IsOptional()
  @IsNumber()
  vendorId: number;

  @IsOptional()
  @IsNumber()
  vehicleId?: number;
}
