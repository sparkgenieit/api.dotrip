import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, UsePipes } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { ValidationPipe } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('admin/vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateVendorDto) {
    return this.vendorService.create(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAll() {
    return this.vendorService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(+id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.vendorService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.vendorService.remove(+id);
  }
}