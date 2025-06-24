import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { AddressBookService } from './address-book.service';
import { CreateAddressBookDto } from './dto/create-address-book.dto';
import { UpdateAddressBookDto } from './dto/update-address-book.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Controller('addresses')
export class AddressBookController {
  constructor(private service: AddressBookService) {}

  @Post() create(@Body() dto: CreateAddressBookDto) { return this.service.create(dto); }

  @Get('user/:userId') findAll(@Param('userId') userId: string) {
    return this.service.findAllForUser(+userId);
  }
// GET a single address by its ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const address = await this.service.findOne(+id);
    if (!address) {
      // If not found, throw a 404
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateAddressBookDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(+id); }
}
