// src/admin/admin.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TripsModule } from './trips/trips.module';
import { VendorModule } from './vendor/vendor.module';  // ← add this

@Module({
  imports: [
    VendorModule,         // ← import the entire vendor module
    TripsModule,
  ],

  controllers: [],
  providers: [  PrismaService],
})
export class AdminModule {}
