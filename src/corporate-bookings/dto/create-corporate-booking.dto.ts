import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCorporateBookingDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  contactPerson: string;

  @IsNotEmpty()
  @IsString()
  contactEmail: string;

  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @IsNotEmpty()
  @IsString()
  numberOfVehicles: string;

  @IsNotEmpty()
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

  @IsNotEmpty()
  bookingId: number;
}
