import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  name: string;

  @IsString()
  model: string;

  @IsString()
  image: string;

  @IsInt()
  capacity: number;

  @IsInt()
  price: number;

  @IsInt()
  originalPrice: number;

  @IsString()
  registrationNumber: string;

  @IsInt()
  vehicleTypeId: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  comfortLevel?: number;

  @IsOptional()
  @IsDateString()
  lastServicedDate?: string;

  @IsOptional()
  @IsInt()
  vendorId?: number;
}
