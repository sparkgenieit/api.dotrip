import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
 
}