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
      // Treat missing user as invalid credentials
      return null;
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      return null;
    }
    // Strip password before returning
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

    response.cookie(JWT_ACCESS_COOKIE, accessToken, { httpOnly: true, sameSite: 'lax' });
    response.cookie(JWT_REFRESH_COOKIE, refreshToken, { httpOnly: true, sameSite: 'lax' });
    return { accessToken };
  }

  async refresh(user: any, response: Response) {
    const payload = { sub: user.sub, email: user.email };
    const accessToken = this.jwtService.sign(payload, { secret: jwtConstants.secret });
    response.cookie(JWT_ACCESS_COOKIE, accessToken, { httpOnly: true, sameSite: 'lax' });
    return { accessToken };
  }

  async logout(response: Response) {
    response.clearCookie(JWT_ACCESS_COOKIE);
    response.clearCookie(JWT_REFRESH_COOKIE);
    return { message: 'Logged out' };
  }
}
