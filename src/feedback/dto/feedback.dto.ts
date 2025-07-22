import { IsInt, IsString, Min, Max } from 'class-validator';

export class FeedbackDto {
  @IsInt()
  tripId: number;

  @IsInt()
  riderId: number;

  @IsInt()
  driverId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  driverRating: number;

  @IsInt()
  @Min(1)
  @Max(5)
  vehicleRating: number;

  @IsInt()
  @Min(1)
  @Max(5)
  serviceRating: number;

  @IsString()
  comment: string;
}
