import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { JWT_ACCESS_COOKIE } from '../common/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.[JWT_ACCESS_COOKIE],
      ]),
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email };
  }
}
