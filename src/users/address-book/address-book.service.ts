import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressBookDto } from './dto/create-address-book.dto';
import { UpdateAddressBookDto } from './dto/update-address-book.dto';

@Injectable()
export class AddressBookService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Create new address for a user
  async create(dto: CreateAddressBookDto & { userId: number }) {
    return this.prisma.addressBook.create({
      data: {
        ...dto,
      },
    });
  }

  // ✅ Get all address-book entries for a user
  async findAllForUser(userId: number) {
    return this.prisma.addressBook.findMany({
      where: { userId },
    });
  }

  // ✅ Get one address entry by ID
  async findOne(id: number) {
    return this.prisma.addressBook.findUnique({
      where: { id },
    });
  }

  // ✅ Update address, only if owned by user
  async update(id: number, dto: UpdateAddressBookDto, userId: number) {
    const address = await this.prisma.addressBook.findUnique({ where: { id } });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this address');
    }

    return this.prisma.addressBook.update({
      where: { id },
      data: dto,
    });
  }

  // ✅ Delete address, only if owned by user
  async remove(id: number, userId: number) {
    const address = await this.prisma.addressBook.findUnique({ where: { id } });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this address');
    }

    return this.prisma.addressBook.delete({
      where: { id },
    });
  }
}
