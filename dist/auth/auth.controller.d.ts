/// <reference types="cookie-parser" />
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: Request, res: Response): Promise<{
        accessToken: string;
    }>;
    refresh(req: any, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
}
