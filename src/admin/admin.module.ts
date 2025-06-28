// src/admin/admin.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriversService } from './drivers/drivers.service';
import { DriversController } from './drivers/drivers.controller';

import { VendorModule } from './vendor/vendor.module';  // ← add this

@Module({
  imports: [
    VendorModule,         // ← import the entire vendor module
  ],
  controllers: [DriversController],
  providers: [DriversService,  PrismaService],
})
export class AdminModule {}
