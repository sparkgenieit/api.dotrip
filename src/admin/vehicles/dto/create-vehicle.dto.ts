import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateVehicleDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() model: string;
  @IsString() @IsNotEmpty() image: string;
  @IsNumber() capacity: number;
  @IsNumber() @IsOptional() price?: number;
  @IsNumber() @IsOptional() originalPrice?: number;
  @IsString()
  @IsNotEmpty()
  registrationNumber: string; // 
  @IsOptional() @IsNumber() vendorId?: number;
  @IsOptional() @IsNumber() driverId?: number;
}
