import { Module } from '@nestjs/common';
import { TripTypesService } from './trip-types.service';
import { TripTypesController } from './trip-types.controller';

@Module({
  providers: [TripTypesService],
  controllers: [TripTypesController],
})
export class TripTypesModule {}
