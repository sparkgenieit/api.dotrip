import { IsNotEmpty, IsString, IsNumber,IsOptional,IsInt } from 'class-validator';

export class TripAssistanceDto {
  @IsNumber()
  @IsNotEmpty()
  tripId: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsInt()
  driverId?: number;

}
