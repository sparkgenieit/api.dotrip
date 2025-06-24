import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { RegisterDriverDto } from './dto/register-driver.dto';
import type { Request } from 'express';

@Controller('admin/drivers')
@UseGuards(AuthGuard('jwt'))
export class DriversController {
  constructor(private readonly svc: DriversService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateDriverDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.svc.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(+id);
  }

  @Post('register')
  async register(
    @Req() req: Request & { user: { role: 'ADMIN' | 'VENDOR'; vendorId?: number } },
    @Body() dto: RegisterDriverDto
  ) {
    const user = req.user;
    if (user.role === 'VENDOR') {
      dto.vendorId = user.vendorId;
    }
    return this.svc.register(dto);
  }
}
