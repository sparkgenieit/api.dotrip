import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SubmitQuoteDto {
  @IsNumber()
  bookingId: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  vendorId: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
