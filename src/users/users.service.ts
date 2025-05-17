import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressBookDto } from './address-book/dto/create-address-book.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    dto: CreateUserDto & { addresses?: CreateAddressBookDto[] }
  ): Promise<User> {
    const { addresses, ...userData } = dto;
    return this.prisma.user.create({
      data: {
        ...userData,
        addresses: addresses?.length
          ? {
              create: addresses.map((a) => ({
                type:          a.type,
                name:          a.name,
                addressLine1:  a.addressLine1,
                buildingName:  a.buildingName,
                addressLine2:  a.addressLine2,
                flatNo:        a.flatNo,
                city:          a.city,
                state:         a.state,
                phone:         a.phone,
                pinCode:       a.pinCode,
              })),
            }
          : undefined,
      },
    });
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

  update(
    id: number,
    dto: UpdateUserDto & { addresses?: CreateAddressBookDto[] }
  ): Promise<User> {
    const { addresses, ...userData } = dto;
    return this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        addresses: addresses?.length
          ? {
              create: addresses.map((a) => ({
                type:          a.type,
                name:          a.name,
                addressLine1:  a.addressLine1,
                buildingName:  a.buildingName,
                addressLine2:  a.addressLine2,
                flatNo:        a.flatNo,
                city:          a.city,
                state:         a.state,
                phone:         a.phone,
                pinCode:       a.pinCode,
              })),
            }
          : undefined,
      },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
