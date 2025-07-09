import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class CalculateDistanceDto {
  @IsArray()
  @ArrayMinSize(2, { message: 'At least two city IDs are required' })
  @IsInt({ each: true })
  cityIds: number[]; // Ordered list: [from, stop1, stop2, ..., to]
}
