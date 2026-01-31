import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Role } from '@prisma/client';

export class CreateVehicleDto {
  // file gets mapped by controller → '/uploads/vehicles/<filename>'
  @IsOptional() @IsString() image?: string;

  // optional array of extra images (we’ll set from controller if multiple files come)
  @IsOptional() additional_images?: any;

  // identifiers
   @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value
  )
  @IsString()
  registrationNumber: string;
  @IsOptional() @IsString() chassisNumber?: string;

  // relations
  @Type(() => Number) @IsInt() vehicleTypeId: number;
  @IsOptional() @Type(() => Number) vendorId?: number | null;
  @IsOptional() @Type(() => Number) driverOwnerId?: number | null;

  // misc
  @IsOptional() @IsString() status?: string; // 'available' | 'maintenance' | 'out_of_service'
  @IsOptional() @IsEnum(Role) createdBy?: Role;

  // maintenance/dates (accept "YYYY-MM-DD" as string; service converts to Date)
  @IsOptional() @IsString() lastServicedDate?: string;
  @IsOptional() @IsString() vehicleExpiryDate?: string;

  // NEW charges
  @IsOptional() @Type(() => Number) extraKmCharge?: number | null;
  @IsOptional() @Type(() => Number) earlyMorningCharges?: number | null;
  @IsOptional() @Type(() => Number) eveningCharges?: number | null;

  // NEW media
  @IsOptional() @IsString() videoUrl?: string | null;

  // Insurance & FC (strings parsed to Date where needed)
  @IsOptional() @IsString() insurancePolicyNumber?: string;
  @IsOptional() @IsString() insuranceContactNumber?: string;
  @IsOptional() @IsString() rtoCode?: string;
  @IsOptional() @IsString() insuranceStartDate?: string; // 'YYYY-MM-DD'
  @IsOptional() @IsString() insuranceEndDate?: string;   // 'YYYY-MM-DD'

  // Allow bracketed multipart keys from the frontend (ignored by validator, present for typing)
  @IsOptional() ['priceSpec[priceType]']?: string;
  @IsOptional() ['priceSpec[price]']?: string | number;
  @IsOptional() ['priceSpec[currency]']?: string;

  // Optional structured priceSpec if someone posts JSON
  @IsOptional() priceSpec?: { priceType?: string; price?: number; currency?: string };
}