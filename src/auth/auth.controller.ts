// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request & { user: any }
  ) {
    // simply return whatever login() returns
 const result = await this.auth.login(req.user);
  console.log('✅ Login Response:', result);
  return result;
  }
}
