
import { IsString, IsDateString, IsOptional, IsInt, Min, IsNumber, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// helper to normalize empty strings to undefined
const EmptyToUndefined = () =>
  Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value));

export class CreateBookingPublicDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  pickupLocation: string;

  @IsString()
  dropoffLocation: string;

  // NEW: date-only (YYYY-MM-DD)
  @IsDateString()
  pickupDate: string;

  // NEW: time-only (HH:mm, 24h)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'pickupTime must be HH:mm' })
  pickupTime: string;

  // NEW: optional date-only for round trips
  @IsOptional()
  @IsDateString()
  @EmptyToUndefined()
  returnDate?: string;

  // NEW: optional time-only (HH:mm) for round trips
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'returnTime must be HH:mm' })
  @EmptyToUndefined()
  returnTime?: string;

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

  // Passengers/vehicles
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numPersons: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numVehicles?: number;

  // Common aliases (optional)
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  noOfPersons?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  personsCount?: number;

  // Fare (float)
  @Type(() => Number)
  @IsNumber()
  fare: number;
}
