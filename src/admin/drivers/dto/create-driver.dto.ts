import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  license: string;

  @IsNumber()
  userId: number;

  @IsNumber()
  vendorId: number;

  @IsOptional()
  @IsNumber()
  vehicleId?: number;
}
