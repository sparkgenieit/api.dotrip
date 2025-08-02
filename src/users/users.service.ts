import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from './role.enum'; // ✅ use your local enum

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ✅ Find by phone (used in OTP login flow)
  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  // ✅ Create user with phone number after OTP verified
 async create(phone: string, role?: Role) {
  return this.prisma.user.create({
    data: {
      name:  'Guest',
      email: `guest_${Date.now()}@example.com`, // ✅ unique dummy
      phone,
      role:  role ?? Role.RIDER,
    },
  });
}

  // ✅ Get user by token (for AuthGuard)
  async findToken(token: string) {
    return this.prisma.user.findFirst({
      where: { token },
    });
  }

  // ✅ Get user by ID (basic profile fetch)
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ✅ Update basic user profile
  async updateUser(userId: number, dto: Partial<{ name: string; phone: string; age: number; gender: string }>) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }
}
