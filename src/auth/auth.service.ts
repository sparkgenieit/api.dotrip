// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate the user's credentials.
   * Throws UnauthorizedException if invalid.
   * Returns the user record if valid.
   */
  async validateUser(email: string, password: string) {
    // 1) lookup by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2) compare hashed passwords
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3) return user info (sans password)
    const { password: _, ...rest } = user;
    return rest;
  }

  /**
   * Issue a JWT for the validated user.
   */
  async login(user: { id: number; email: string; role: string }) {
 const vendor = await this.prisma.vendor.findFirst({
  where: { userId: user.id },
});

const driver = await this.prisma.driver.findFirst({
  where: { userId: user.id },
});

    const payload: any = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(vendor && { vendorId: vendor.id }),
      ...(driver && { driverId: driver.id }),
    };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }
}
