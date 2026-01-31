// src/drivers/dto/create-driver-basic.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDriverBasicDto {
  @IsNotEmpty() @IsString()
  fullName!: string;

  @IsNotEmpty() @IsString()
  phone!: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsNotEmpty() @IsString()
  licenseNumber!: string;

  @IsNotEmpty() @IsDateString()
  licenseExpiry!: string; // YYYY-MM-DD

  @IsOptional() @IsDateString()
  licenseIssueDate?: string;

  @IsOptional() @IsDateString()
  dob?: string;

  @IsOptional() @IsString()
  gender?: string;

  @IsOptional() @IsString()
  bloodGroup?: string;

  @IsOptional() @IsString()
  whatsappPhone?: string;

  @IsOptional() @IsString()
  altPhone?: string;

  @IsOptional() @IsString()
  aadhaarNumber?: string;

  @IsOptional() @IsString()
  panNumber?: string;

  @IsOptional() @IsString()
  voterId?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  vendorId?: number;
}
