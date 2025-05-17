// src/places/places.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly places: PlacesService) {}

  @Get('autocomplete')
  getAutocomplete(
    @Query('input') input: string,
    @Query('sessiontoken') sessiontoken: string,
  ) {
    return this.places.getAutocomplete(input, sessiontoken);
  }
}
