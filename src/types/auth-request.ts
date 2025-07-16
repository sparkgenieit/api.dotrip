// src/types/auth-request.ts

import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
    vendorId?: number;
    adminId?: number;
    driverId?: number;
    riderId?: number; // ✅ Added this line
  };
}
