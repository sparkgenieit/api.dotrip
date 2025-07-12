
import { IsInt, IsDateString, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateTripDto {
  @IsInt()
  bookingId: number;

  @IsInt()
  riderId: number;

  @IsInt()
  driverId: number;

  @IsInt()
  vehicleId: number;

  @IsInt()
  vendorId: number;

  @IsDateString()
  startTime: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsNumber()
  distance?: number;

  @IsOptional()
  @IsNumber()
  fare?: number;

  @IsOptional()
  @IsBoolean()
  breakdownReported?: boolean;

  @IsOptional()
  @IsString()
  breakdownNotes?: string;

  @IsOptional()
  @IsInt()
  corporateBookingId?: number;
}
