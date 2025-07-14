import {
  IsString,
  IsEmail,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateBookingPublicDto {
   @IsString()
  phone?: string;

  @IsString()
  pickupLocation: string;

  @IsString()
  dropoffLocation: string;

  @IsDateString()
  pickupDateTime: string;

  @IsNumber()
  fromCityId: number;

  @IsNumber()
  toCityId: number;

  @IsNumber()
  tripTypeId: number;

  @IsNumber()
  vehicleTypeId: number;

  @IsNumber()
  fare: number;
}
