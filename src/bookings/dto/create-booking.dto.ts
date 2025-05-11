import { IsInt, IsDateString, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsInt() userId: number;
  @IsInt() vehicleId: number;
  @IsInt() fromCityId: number;
  @IsInt() toCityId: number;
  @IsDateString() pickupDateTime: string;
  @IsInt() tripTypeId: number;
  @IsNumber() fare: number;
}
