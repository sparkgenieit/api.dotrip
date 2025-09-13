import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsVehiclesController } from './vendors-vehicles.controller'; // <-- ADD
import { VendorsService } from './vendors.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VendorsController, VendorsVehiclesController], // <-- ADD controller
  providers: [VendorsService, PrismaService],
  exports: [VendorsService],
})
export class VendorsModule {}