import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JWT_ACCESS_COOKIE } from '../common/constants';

// Extract from header or cookie
const cookieExtractor = (req: Request): string | null =>
  req?.cookies?.[JWT_ACCESS_COOKIE] ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWT_SECRET,
    } as StrategyOptions);
  }

  async validate(payload: any) {
    // Fetch user from DB to get vendorId
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, vendorId: true },
    });
    if (!user) {
      return null;
    }
    return {
      userId:   user.id,
      email:    user.email,
      role:     user.role,
      vendorId: user.vendorId,
    };
  }
}
