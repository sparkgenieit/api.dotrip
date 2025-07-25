import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards,Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from '@nestjs/common';
import { AuthRequest } from "../types/auth-request";


@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // users.controller.ts
@Post('check-email')
async checkEmail(@Body('email') email: string) {
  const user = await this.usersService.findByEmailWithAddresses(email);
  if (!user) return { exists: false };

  return {
    exists: true,
    user: {
      id: user.id,
      name: user.name,
      phone:user.phone,
      email: user.email,
    },
    addresses: user.addressBooks,
  };
}

// users.controller.ts
@Post('check-phone')
async checkPhone(@Body('phone') phone: string) {
  const user = await this.usersService.findByPhone(phone);
  if (!user) return { exists: false };

  return {
    exists: true,
    user: {
      id: user.id,
      name: user.name,
      phone:user.phone,
      email: user.email,
    },
    addresses: user.addressBooks,
  };
}

@Get('/me')
getProfile(@Req() req: AuthRequest) {
  
  return this.usersService.findOne(req.user.id);
}


@Patch('/me')
updateProfile(@Body() dto: UpdateUserDto, @Param() params,@Req() req: AuthRequest) {
  return this.usersService.update(req.user.id, dto);
}

@Post('change-password')
   async changePassword(
 @Req() req: AuthRequest,
  @Body('currentPassword') currentPassword: string,
  @Body('newPassword') newPassword: string
  ) {
  return this.usersService.changePassword(req.user.id, currentPassword, newPassword);
}



}