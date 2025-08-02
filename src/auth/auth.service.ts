// src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
// import { Msg91Service } from 'src/msg91'; // optional external OTP service
import { AuthRequestDto, VerifyOtpRequestDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    // private msg91Service: Msg91Service, // Uncomment if using real SMS
  ) {}

  /**
   * Email/Password login
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

    const { password: _, ...rest } = user;
    return rest;
  }

  async login(user: { id: number; email: string; role: string }) {
    const vendor = await this.prisma.vendor.findFirst({ where: { userId: user.id } });
    const driver = await this.prisma.driver.findFirst({ where: { userId: user.id } });

    const payload: any = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(vendor && { vendorId: vendor.id }),
      ...(driver && { driverId: driver.id }),
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  /**
   * 🔐 Send OTP to phone number
   */
  async authenticate(authRequestDto: AuthRequestDto) {
    const { mobileNumber } = authRequestDto;

    const isTestAccount =
      mobileNumber === process.env.TEST_ACCOUNT_MOBILE &&
      process.env.ENABLE_TEST_ACCOUNT === 'true';

    if (!isTestAccount) {
      // await this.msg91Service.sendOtp(mobileNumber); // Real OTP
      console.log(`OTP sent to ${mobileNumber}`); // Dev/test mock
    }

    return { message: 'OTP sent successfully' };
  }

  /**
   * 🔐 Verify OTP and login/create user
   */
  async verifyOtp(dto: VerifyOtpRequestDto) {
    const { mobileNumber, otp } = dto;

    const isTestAccount =
      mobileNumber === process.env.TEST_ACCOUNT_MOBILE &&
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
        email: `user_${mobileNumber}@otpuser.com`, // or `${mobileNumber}@dummy.com` if `email` is required
        password: password,
      },
    });
    }

    const payload = { sub: user.id, phone: mobileNumber, role: user.role };

    const token = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { token },
    });

    return { access_token: token };
  }

  /**
   * 👤 Get Profile
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
