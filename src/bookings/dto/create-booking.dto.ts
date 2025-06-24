// src/booking/dto/create-booking.dto.ts

import {
  IsInt,
  IsString,
  IsDateString,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  vehicleId: number;

  @IsInt()
  @IsNotEmpty()
  fromCityId: number;

  @IsInt()
  @IsNotEmpty()
  toCityId: number;

  @IsString()
  @IsNotEmpty()
  pickupAddressId: string;

  @IsString()
  @IsNotEmpty()
  dropAddressId: string;

  @IsDateString()
  @IsNotEmpty()
  pickupDateTime: string;

  @IsInt()
  @IsNotEmpty()
  tripTypeId: number;

  @IsNumber()
  @IsNotEmpty()
  fare: number;
}
