// src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
// import { Msg91Service } from 'src/msg91';
import { AuthRequestDto, VerifyOtpRequestDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    // private msg91Service: Msg91Service,
  ) {}

  // ─────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────
  private normalizePhone(input?: string) {
    if (!input) return input;
    return input.replace(/[^\d]/g, ''); // keep digits only
  }

  private isEmailLike(value: string) {
    return value.includes('@');
  }

  /**
   * Email/Phone + Password login
   * Accepts either email or mobile number in `identifier`.
   */
  async validateUser(identifier: string, password: string) {
    if (!identifier || !password) {
      throw new BadRequestException('Identifier and password are required');
    }

    const looksLikeEmail = this.isEmailLike(identifier);
    const normalizedPhone = this.normalizePhone(identifier);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          looksLikeEmail ? { email: identifier } : undefined,
          !looksLikeEmail ? { phone: normalizedPhone } : undefined,
        ].filter(Boolean) as any,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      // Likely created via OTP-only signup
      throw new UnauthorizedException('Password login not enabled. Use OTP login.');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _pw, ...rest } = user;
    return rest; // { id, email, phone, role }
  }

  /**
   * Create JWT and include related IDs when available
   */
  async login(user: { id: number; email?: string; phone?: string; role: string }) {
    const [vendor, driver] = await Promise.all([
      this.prisma.vendor.findFirst({ where: { userId: user.id }, select: { id: true } }),
      this.prisma.driver.findFirst({ where: { userId: user.id }, select: { id: true } }),

    ]);

    const payload: any = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      ...(vendor && { vendorId: vendor.id }),
      ...(driver && { driverId: driver.id }),
    
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  // ─────────────────────────────────────────────────────
  // OTP FLOW (unchanged behavior)
  // ─────────────────────────────────────────────────────

  /**
   * 🔐 Send OTP to phone number
   */
  async authenticate(authRequestDto: AuthRequestDto) {
    const mobileNumber = this.normalizePhone(authRequestDto.mobileNumber);

    const isTestAccount =
      mobileNumber === this.normalizePhone(process.env.TEST_ACCOUNT_MOBILE) &&
      process.env.ENABLE_TEST_ACCOUNT === 'true';

    if (!isTestAccount) {
      // await this.msg91Service.sendOtp(mobileNumber);
      console.log(`OTP sent to ${mobileNumber}`); // Dev/test mock
    }

    return { message: 'OTP sent successfully' };
  }

  /**
   * 🔐 Verify OTP and login/create user
   */
  async verifyOtp(dto: VerifyOtpRequestDto) {
    const mobileNumber = this.normalizePhone(dto.mobileNumber);
    const otp = dto.otp;

    const isTestAccount =
      mobileNumber === this.normalizePhone(process.env.TEST_ACCOUNT_MOBILE) &&
      process.env.ENABLE_TEST_ACCOUNT === 'true';

    if (!isTestAccount) {
      // await this.msg91Service.verifyOtp(mobileNumber, otp);
      if (otp !== '123456') {
        throw new UnauthorizedException('Invalid OTP');
      }
    }

    let user = await this.prisma.user.findFirst({ where: { phone: mobileNumber } });

    if (!user) {
      const password = await bcrypt.hash('123123', 10);
      user = await this.prisma.user.create({
        data: {
          phone: mobileNumber,
          role: 'RIDER',
          name: 'PhoneUser',
          email: `user_${mobileNumber}@otpuser.com`, // fallback if email is required
          password,
        },
      });
    }

    const payload = {
      sub: user.id,
      phone: mobileNumber,
      role: user.role,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { token },
    });

    return { access_token: token };
  }

  // ─────────────────────────────────────────────────────
  // Profile & Logout
  // ─────────────────────────────────────────────────────

  /**
   * 👤 Get Profile
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new UnauthorizedException('Unauthorized');
    return user;
  }

  /**
   * 🚪 Logout
   */
  async logout(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Unauthorized');

    await this.prisma.user.update({
      where: { id: userId },
      data: { token: null },
    });

    return { message: 'Logged out successfully' };
  }
}
