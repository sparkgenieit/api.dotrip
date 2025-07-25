import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsString as IsStringArray,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateVehicleDto {
  @IsString()
  name: string;

  @IsString()
  model: string;

  @IsArray()
  @IsStringArray({ each: true })
  @IsOptional()
  image: string[];

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  capacity: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  price: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  originalPrice: number;

  @IsString()
  registrationNumber: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  vehicleTypeId: number;

  @IsOptional()
  @IsString()
  status?: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsInt()
  comfortLevel?: number;

  @IsOptional()
  @IsDateString()
  lastServicedDate?: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsInt()
  vendorId?: number;
}
