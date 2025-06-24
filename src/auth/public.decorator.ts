// src/auth/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

// Key that the JwtAuthGuard will look for
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() marks a route as skip-JWT-check.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
