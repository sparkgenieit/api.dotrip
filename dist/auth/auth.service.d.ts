import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any, response: Response): Promise<{
        accessToken: string;
    }>;
    refresh(user: any, response: Response): Promise<{
        accessToken: string;
    }>;
    logout(response: Response): Promise<{
        message: string;
    }>;
}
