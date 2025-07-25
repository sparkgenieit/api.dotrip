import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {

     let plainPassword: string;
    if (dto.password && dto.password.length > 0) {
      plainPassword = dto.password;
    } else {
      // Generate a random 16‐byte hex string (32 characters) as a fallback password:
      plainPassword = randomBytes(16).toString('hex');
      // e.g. "9f74ab2c5d1e4f0a3b8c7e2d4a1b0c9f"
    }

    // 3) Hash the password:
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    return this.prisma.user.create({
      data: {
        name:     dto.name,
        email:    dto.email,
        password: hashedPassword,
        phone:    dto.phone,
        role:     dto.role,
       
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const updateData: any = {
      name:   dto.name,
      phone:  dto.phone,
      role:   dto.role,
      age:    dto.age,
      gender: dto.gender,
    };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data:  updateData,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }

async findByEmailWithAddresses(email: string) {
  return this.prisma.user.findUnique({
    where: { email },
    include: {
      addressBooks: {
        where: {
          type: {
            in: ['PICKUP', 'DROP'],
          },
        },
      },
    },
  });
}


async findByPhone(phone: string) {
  return this.prisma.user.findFirst({
    where: { phone },
    include: {
      addressBooks: {
        where: {
          type: {
            in: ['PICKUP', 'DROP'],
          },
        },
      },
    },
  });
}

async findUserById(id: number) {
  return this.prisma.user.findUnique({ where: { id } });
}

async updateUser(userId: number, dto: UpdateUserDto) {
  const updateFields: any = {};

  if (dto.name) updateFields.name = dto.name;
  if (dto.email) updateFields.email = dto.email;
  if (dto.phone) updateFields.phone = dto.phone;
  if (dto.age !== undefined) updateFields.age = dto.age;
  if (dto.gender) updateFields.gender = dto.gender;

  return this.prisma.user.update({
    where: { id: userId },
    data: dto,
  });
}

async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ForbiddenException('User not found');

  const passwordValid = await bcrypt.compare(currentPassword, user.password);
  if (!passwordValid) throw new ForbiddenException('Current password is incorrect');

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await this.prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password changed successfully' };
}

}
