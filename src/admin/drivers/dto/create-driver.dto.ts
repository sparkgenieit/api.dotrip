import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() license: string;
  @IsNumber() userId: number;
  @IsOptional() @IsNumber() vendorId?: number;
  @IsOptional() @IsNumber() vehicleId?: number;
}
