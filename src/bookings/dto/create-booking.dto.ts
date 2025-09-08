import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsInt, Min, Matches, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

const EmptyToUndefined = () =>
  Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value));

export class CreateBookingDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  vehicleTypeId: number;

  @IsNumber()
  pickupAddressId: number;

  @IsNumber()
  dropAddressId: number;

  // NEW: split pickupDate/time + optional returnDate/time
  @IsDateString()
  pickupDate: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  pickupTime: string;

  @IsOptional() @IsDateString() @EmptyToUndefined()
  returnDate?: string;

  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) @EmptyToUndefined()
  returnTime?: string;

  @IsNumber()
  fromCityId: number;

  @IsNumber()
  toCityId: number;

  @IsNumber()
  tripTypeId: number;

  @IsNumber()
  fare: number;

  @IsNotEmpty()
  status: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  numPersons?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  numVehicles?: number;
}