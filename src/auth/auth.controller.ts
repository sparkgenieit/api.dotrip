// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  HttpCode,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthRequestDto, VerifyOtpRequestDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * 🔐 Password login with email or mobile number.
   * Body: { identifier: string; password: string }
   */
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { identifier: string; password: string }) {
    const { identifier, password } = body || {};
    if (!identifier || !password) {
      throw new BadRequestException('identifier and password are required');
    }
    const safeUser = await this.auth.validateUser(identifier, password);
    const result = await this.auth.login(safeUser);
    // console.log('✅ Login Response:', result);
    return result;
  }

  /**
   * 📲 Send OTP
   */
  @Post('send-otp')
  @HttpCode(200)
  async sendOtp(@Body() dto: AuthRequestDto) {
    return this.auth.authenticate(dto); // returns { message: 'OTP sent successfully' }
  }

  /**
   * 🔁 Resend OTP (optional)
   */
  @Post('resend-otp')
  @HttpCode(200)
  async resendOtp(@Body() dto: AuthRequestDto) {
    return this.auth.authenticate(dto);
  }

  /**
   * ✅ Verify OTP and login/register
   */
  @Post('verify-otp')
  @HttpCode(200)
  async verifyOtp(@Body() dto: VerifyOtpRequestDto) {
    return this.auth.verifyOtp(dto); // returns { access_token }
  }

  /**
   * 👤 Get Profile (JWT protected)
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.auth.getProfile(req.user.sub);
  }

  /**
   * 🚪 Logout (JWT protected)
   */
  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  @HttpCode(204)
  async logout(@Req() req: any) {
    await this.auth.logout(req.user.sub);
  }
}
