import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  Get,
  Delete,
  HttpCode,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthRequestDto, VerifyOtpRequestDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // 🔐 Email/Password Login (Local Strategy)
 
  @Post('login')
  async login(@Req() req: Request & { user: any }) {
    const result = await this.auth.login(req.user);
    console.log('✅ Login Response:', result);
    return result;
  }

  // 📲 Send OTP
  @Post('send-otp')
 
  async sendOtp(@Body() dto: AuthRequestDto) {
    await this.auth.authenticate(dto);
  }

  // 🔁 Resend OTP (optional)
  @Post('resend-otp')
  @HttpCode(200)
  async resendOtp(@Body() dto: AuthRequestDto) {
    await this.auth.authenticate(dto);
  }

  // ✅ Verify OTP and login/register
  @Post('verify-otp')
  @HttpCode(200)
  async verifyOtp(@Body() dto: VerifyOtpRequestDto) {
    return this.auth.verifyOtp(dto);
  }

  // 👤 Get Profile (JWT protected)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.auth.getProfile(req.user.sub);
  }

  // 🚪 Logout (JWT protected)
  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  @HttpCode(204)
  async logout(@Req() req: any) {
    await this.auth.logout(req.user.sub);
  }
}
