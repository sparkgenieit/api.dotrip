import { Module } from '@nestjs/common';
import { DriverUpdatesController } from './driver-updates.controller';
import { DriverUpdatesService } from './driver-updates.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DriverUpdatesController],
  providers: [DriverUpdatesService, PrismaService],
})
export class DriverUpdatesModule {}
