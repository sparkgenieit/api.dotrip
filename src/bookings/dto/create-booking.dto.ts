import { IsNotEmpty, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  vehicleTypeId: number;

  @IsNumber()
  pickupAddressId: number;

  @IsNumber()
  dropAddressId: number;

  @IsDateString()
  pickupDateTime: string;

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
}