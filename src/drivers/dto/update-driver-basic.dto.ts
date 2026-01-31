// NEW FILE: src/drivers/dto/update-driver-basic.dto.ts
import { IsOptional, IsString, IsEmail, IsDateString, IsNumberString } from 'class-validator';

export class UpdateDriverBasicDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail()  email?: string;

  @IsOptional() @IsString() whatsappPhone?: string;
  @IsOptional() @IsString() altPhone?: string;

  @IsOptional() @IsString() licenseNumber?: string;
  @IsOptional() @IsDateString() licenseIssueDate?: string;
  @IsOptional() @IsDateString() licenseExpiry?: string;

  @IsOptional() @IsDateString() dob?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() bloodGroup?: string;

  @IsOptional() @IsNumberString() aadhaarNumber?: string;
  @IsOptional() @IsString() panNumber?: string;
  @IsOptional() @IsString() voterId?: string;

  @IsOptional() @IsString() address?: string;

  @IsOptional() vendorId?: number;
}
