import { Module } from '@nestjs/common';
import { DriversController } from './driver.controller';
import { DriversService } from './driver.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  // If using PrismaModule, add it to imports: [PrismaModule]
  imports: [],
  controllers: [DriversController],
  providers: [DriversService, PrismaService],
  exports: [DriversService],
})
export class DriversModule {}