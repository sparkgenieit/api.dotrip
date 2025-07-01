import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { CorporateBookingService } from './corporate-booking.service';
import { CreateCorporateBookingDto } from './dto/create-corporate-booking.dto';
import { UpdateCorporateBookingDto } from './dto/update-corporate-booking.dto';

@Controller('corporate-booking')
export class CorporateBookingController {
  constructor(private readonly corporateBookingService: CorporateBookingService) {}

  @Post()
  create(@Body() dto: CreateCorporateBookingDto) {
    return this.corporateBookingService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.corporateBookingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCorporateBookingDto) {
    return this.corporateBookingService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.corporateBookingService.remove(+id);
  }
}
