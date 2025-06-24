import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class RegisterDriverDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() password: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() license: string;
  @IsOptional() @IsNumber() vendorId?: number;
  @IsOptional() @IsNumber() vehicleId?: number;
}
