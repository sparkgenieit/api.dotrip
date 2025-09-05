import { IsString, IsDateString, IsOptional, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingPublicDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  pickupLocation: string;

  @IsString()
  dropoffLocation: string;

  @IsDateString()
  pickupDateTime: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  // ---- IDs (cast to number, validate as int)
  @Type(() => Number)
  @IsInt()
  fromCityId: number;

  @Type(() => Number)
  @IsInt()
  toCityId: number;

  @Type(() => Number)
  @IsInt()
  tripTypeId: number;

  @Type(() => Number)
  @IsInt()
  vehicleTypeId: number;

  // ---- NEW: persons/vehicles (these were missing)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numPersons: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numVehicles?: number;

  // (Optional) accept common aliases without breaking validation
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  noOfPersons?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  personsCount?: number;

  // Fare can be float
  @Type(() => Number)
  @IsNumber()
  fare: number;
}
