// src/admin/vendor/vendor.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Vendor core
import { VendorService }    from './vendor.service';
import { VendorController } from './vendor.controller';



// Trip management
import { TripsService }    from './trips.service';
import { TripsController } from './trips.controller';

// Earnings reporting
import { EarningsService }    from './earnings.service';
import { EarningsController } from './earnings.controller';

@Module({
  imports: [],
  controllers: [
    VendorController,
   
    TripsController,
    EarningsController,
  ],
  providers: [
    VendorService,
  
    TripsService,
    EarningsService,
    PrismaService,
  ],
})
export class VendorModule {}
