import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { AddressBookService } from './address-book.service';
import { CreateAddressBookDto } from './dto/create-address-book.dto';
import { UpdateAddressBookDto } from './dto/update-address-book.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthRequest } from '../../types/auth-request';


@UseGuards(JwtAuthGuard)
@Controller('address-book')
export class AddressBookController {
  constructor(private readonly service: AddressBookService) {}

  // ✅ Create new address for logged-in user
  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateAddressBookDto) {
    return this.service.create({ ...dto, userId: req.user.id });
  }

  // ✅ Get all addresses for current user
  @Get('me')
  async findAllForMe(@Req() req: AuthRequest) {
    return this.service.findAllForUser(req.user.id);
  }

  // ✅ Get a single address by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const address = await this.service.findOne(+id);
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  // ✅ Update address (ensure user check is done in service)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: UpdateAddressBookDto
  ) {
    return this.service.update(+id, dto, req.user.id); // service must verify user
  }

  // ✅ Delete address (secure with user check)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.service.remove(+id, req.user.id); // secure delete
  }
}
