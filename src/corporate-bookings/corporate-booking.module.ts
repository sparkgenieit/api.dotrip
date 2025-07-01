import { Module } from '@nestjs/common';
import { CorporateBookingService } from './corporate-booking.service';
import { CorporateBookingController } from './corporate-booking.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CorporateBookingController],
  providers: [CorporateBookingService, PrismaService],
})
export class CorporateBookingModule {}
