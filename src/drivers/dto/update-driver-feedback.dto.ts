// NEW FILE: src/drivers/dto/update-driver-feedback.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDriverFeedbackDto {
  @IsOptional() @IsNumber() ratingAvg?: number; // your Review tab's star selection
  @IsOptional() @IsString() remarks?: string;   // feedback text box
  @IsOptional() reviews?: any;                  // array of items (id, rating, description, createdAt)
}
