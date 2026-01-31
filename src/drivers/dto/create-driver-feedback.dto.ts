// src/drivers/dto/create-driver-feedback.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDriverFeedbackDto {
  @IsOptional() @IsNumber()
  ratingAvg?: number;

  @IsOptional() @IsString()
  remarks?: string;

  @IsOptional()
  reviews?: any; // JSON array: [{ id, rating, description, createdAt }, ...]
}
