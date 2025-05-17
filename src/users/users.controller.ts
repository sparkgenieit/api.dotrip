import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post() create(@Body() dto: CreateUserDto) { console.log(dto);return this.usersService.create(dto); }

  @Get() findAll() { return this.usersService.findAll(); }

  @Get(':id') findOne(@Param('id') id: string) { return this.usersService.findOne(+id); }

  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  @Delete(':id') remove(@Param('id') id: string) { return this.usersService.remove(+id); }

   /** NEW: check by email via POST so email isn’t in the URL */
  @Post('check-email')
  async checkEmail(@Body('email') email: string) {
    return this.usersService.findByEmail(email);
  }

}
