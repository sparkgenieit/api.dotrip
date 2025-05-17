import { Injectable, NotFoundException } from '@nestjs/common';  // ← add NotFoundException
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUserDto): Promise<User> {

    console.log(dto);
    return this.prisma.user.create({ data: dto });
  }

  
    async findByEmail(email: string) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new NotFoundException('User not found');
      return user;
    }
  
    findAll() {
      return this.prisma.user.findMany();
    }
  
    findOne(id: number) {
      return this.prisma.user.findUnique({ where: { id } });
    }
  
    update(id: number, dto: UpdateUserDto) {
      return this.prisma.user.update({ where: { id }, data: dto });
    }
  
    remove(id: number) {
      return this.prisma.user.delete({ where: { id } });
    }
}


