import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './role.enum';
import { AuthRequest } from '../types/auth-request';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Register new user after OTP verification
  @Post('register')
  @Roles('SUPER_ADMIN', 'ADMIN')
  register(@Body('phone') phone: string, @Body('role') role: Role) {
    return this.usersService.create(phone, role);
  }

  // ✅ Lookup by phone
  @Post('check-phone')
  async checkPhone(@Body('phone') phone: string) {
    const user = await this.usersService.findByPhone(phone);
    if (!user) return { exists: false };

    return {
      exists: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    };
  }

  // ✅ Get current logged-in user's profile
  @Get('me')
  getProfile(@Req() req: AuthRequest) {
    return this.usersService.getUserById(req.user.id);
  }

  // ✅ Update current user's profile
  @Patch('me')
  updateProfile(@Req() req: AuthRequest, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, dto);
  }
}
