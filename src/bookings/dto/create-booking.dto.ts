
import { IsInt, IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  userId: number;

  @IsInt()
  vehicleTypeId: number;

  @IsInt()
  pickupAddressId: number;

  @IsInt()
  dropAddressId: number;

  @IsInt()
  fromCityId: number;

  @IsInt()
  toCityId: number;

  @IsDateString()
  pickupDateTime: string;

  @IsInt()
  tripTypeId: number;

  @IsNumber()
  fare: number;

  @IsString()
  status: string;
}
