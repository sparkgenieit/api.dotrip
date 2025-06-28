
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateCorporateBookingDto {
  @IsString()
  companyName: string;
  vehicleTypeId: number; // not `vehicleType: string`

  @IsString()
  contactPerson: string;

  @IsString()
  contactEmail: string;

  @IsString()
  contactPhone: string;

  @IsString()
  pickupLocation: string;

  @IsString()
  dropoffLocation: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  bookingType: string;

  @IsString()
  numberOfVehicles: string;

  @IsString()
  vehicleType: string;

  @IsString()
  vehicleModel: string;

  @IsString()
  estimatedPassengers: string;

  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
