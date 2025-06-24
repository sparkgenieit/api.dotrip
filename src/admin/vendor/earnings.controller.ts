import { Controller, Get, UseGuards } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('admin/vendor/earnings')
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'VENDOR')
  findAll() {
    return this.earningsService.findAll();
  }
}