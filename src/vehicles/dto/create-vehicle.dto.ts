import { IsInt, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  registrationNumber: string;
 @IsString()
  name: string;

  @IsString()
  model: string;

  @IsString()
  image: string;

  @IsInt()
  capacity: number;

  @IsInt()
  price: number;

  @IsInt()
  originalPrice: number;
}
