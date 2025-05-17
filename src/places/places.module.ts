import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

@Module({
  imports: [
    HttpModule,
    // If you haven't already imported ConfigModule globally, enable it here:
    // ConfigModule.forFeature(),
  ],
  controllers: [PlacesController],
  providers: [PlacesService],
})
export class PlacesModule {}