import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JWT_ACCESS_COOKIE } from '../common/constants';

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
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });

 const vendor = await this.prisma.vendor.findFirst({
  where: { userId: user.id },
});

const driver = await this.prisma.driver.findFirst({
  where: { userId: user.id },
});

    return {
      ...user,
      ...(vendor && { vendorId: vendor.id }),
      ...(driver && { driverId: driver.id }),
    };
  }
}
