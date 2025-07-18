import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CalculateDistanceDto } from './dto/calculate-distance.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  create(@Body() dto: CreateCityDto) {
    return this.citiesService.create(dto);
  }
  @Post('bulk')
  createMany(@Body() cities: CreateCityDto[]) {
    return this.citiesService.createMany(cities);
  }
  @Get()
  findAll() {
    return this.citiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.citiesService.findOne(id);
  }
  @Post('calculate-distance')
  calculateDistance(@Body() dto: CalculateDistanceDto) {
    return this.citiesService.calculateTotalDistance(dto.cityIds);
  }
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCityDto) {
    return this.citiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.citiesService.remove(id);
  }
}
