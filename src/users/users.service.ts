import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from './role.enum'; // ✅ use your local enum

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ✅ Find by phone (used in OTP login flow)
 async findByPhone(phone: string) {
  const user = await this.prisma.user.findUnique({
    where: { phone },
    include: {
      addressBooks: {
        select: {
          id: true,
          type: true,
          address: true,
          city: true,
          pinCode: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }, // newest first
      },
    },
  });

  if (!user) return null;

  // Keep only the first (newest) address per type
  const seen = new Set<string>();
  const deduped = [];
  for (const a of user.addressBooks) {
    if (!seen.has(a.type)) {
      deduped.push(a);
      seen.add(a.type);
    }
  }

  return { ...user, addressBooks: deduped };
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
// src/users/users.service.ts
async getUserById(id: number) {
  return this.prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      addressBooks: {
        select: {
          id: true,
          type: true,
          address: true,
          city: true,
          pinCode: true,
          createdAt: true,
        },
      },
    },
  });
}

  // ✅ Update basic user profile
  async updateUser(userId: number, dto: Partial<{ name: string; phone: string; age: number; gender: string }>) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }
}
