
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { JWT_ACCESS_COOKIE, JWT_REFRESH_COOKIE } from '../common/constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    let user;
    try {
      user = await this.usersService.findByEmail(email);
    } catch {
      return null;
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      return null;
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async login(user: any, response: Response) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { secret: jwtConstants.secret });
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '7d',
    });

    response.cookie(JWT_ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie(JWT_REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  async refresh(user: any, response: Response) {
    const payload = { sub: user.sub, email: user.email };
    const accessToken = this.jwtService.sign(payload, { secret: jwtConstants.secret });

    response.cookie(JWT_ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    return { accessToken };
  }

  async logout(response: Response) {
    response.clearCookie(JWT_ACCESS_COOKIE, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    response.clearCookie(JWT_REFRESH_COOKIE, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/auth/refresh',
    });

    return { message: 'Logged out' };
  }
}
