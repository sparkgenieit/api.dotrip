// src/vehicles/dto/create-vehicle.dto.ts
import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PriceSpecDto {
  @IsIn(['BASE', 'PEAK', 'DISCOUNT'])
  priceType: 'BASE' | 'PEAK' | 'DISCOUNT';

  // Coerce "12" (multipart string) -> number, then validate as int
  @Type(() => Number)
  @IsInt()
  price: number;

  @Type(() => Number)
  @IsInt()
  originalPrice: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateVehicleDto {
  @IsString()
  name: string;

  @IsString()
  model: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  image: string[];

  @Type(() => Number)
  @IsInt()
  capacity: number;

  // ⛔️ Old top-level fields made optional to avoid hard failures
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  originalPrice?: number;

  @IsString()
  registrationNumber: string;

  @Type(() => Number)
  @IsInt()
  vehicleTypeId: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  comfortLevel?: number;

  @IsOptional()
  @IsDateString()
  lastServicedDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendorId?: number;

  // ✅ Preferred: nested priceSpec (works with JSON string OR bracket-notation)
  @IsOptional()
  @ValidateNested()
  @Transform(({ value }) => {
    // Accept JSON string ("{...}") or already-parsed object or bracket-notation object
    if (value == null) return value;
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value; }
    }
    return value;
  })
  @Type(() => PriceSpecDto)
  priceSpec?: PriceSpecDto;

  // ✅ Optional: allow linking an existing Price row directly
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceId?: number;
}
