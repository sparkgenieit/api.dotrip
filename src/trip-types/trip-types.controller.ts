import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TripTypesService } from './trip-types.service';
import { CreateTripTypeDto } from './dto/create-trip-type.dto';
import { UpdateTripTypeDto } from './dto/update-trip-type.dto';

@Controller('trip-types')
export class TripTypesController {
  constructor(private readonly tripTypesService: TripTypesService) {}

  @Post()
  create(@Body() dto: CreateTripTypeDto) {
    return this.tripTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.tripTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tripTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTripTypeDto) {
    return this.tripTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tripTypesService.remove(id);
  }
}
