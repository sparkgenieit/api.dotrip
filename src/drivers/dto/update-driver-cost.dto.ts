// NEW FILE: src/drivers/dto/update-driver-cost.dto.ts
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateDriverCostDto {
  @IsOptional() @IsNumber() driverSalary?: number;
  @IsOptional() @IsNumber() foodCost?: number;
  @IsOptional() @IsNumber() accommodationCost?: number;
  @IsOptional() @IsNumber() bhattaCost?: number;
  @IsOptional() @IsNumber() earlyMorningCharges?: number;
  @IsOptional() @IsNumber() eveningCharges?: number;
}
