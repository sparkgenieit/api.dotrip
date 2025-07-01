import { Module } from '@nestjs/common';
import { VehicleTypesService } from './vehicle-types.service';
import { VehicleTypesController } from './vehicle-types.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VehicleTypesController],
  providers: [VehicleTypesService, PrismaService],
})
export class VehicleTypesModule {}
