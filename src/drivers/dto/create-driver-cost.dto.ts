// src/drivers/dto/create-driver-cost.dto.ts
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDriverCostDto {
  @IsOptional() @Type(() => Number) @IsNumber()
  driverSalary?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  foodCost?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  accommodationCost?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  bhattaCost?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  earlyMorningCharges?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  eveningCharges?: number;
}
