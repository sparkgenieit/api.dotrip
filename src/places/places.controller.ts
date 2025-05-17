import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly places: PlacesService) {}

  @Get('autocomplete')
  async autocomplete(@Query('input') input: string) {
    if (!input?.trim()) {
      throw new BadRequestException('Query param "input" is required');
    }
    return this.places.getAutocomplete(input);
  }
}