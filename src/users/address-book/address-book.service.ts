import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressBookDto } from './dto/create-address-book.dto';
import { UpdateAddressBookDto } from './dto/update-address-book.dto';

@Injectable()
export class AddressBookService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateAddressBookDto) {
    return this.prisma.addressBook.create({ data: dto });
  }

  findAllForUser(userId: number) {
    return this.prisma.addressBook.findMany({
      where: { userId },
    });
  }

    /**
   * [NEW] Get one address-book entry by its ID
   */
  async findOne(id: number) {
    const address = await this.prisma.addressBook.findUnique({
      where: { id },
    });
    return address;
  }

  update(id: number, dto: UpdateAddressBookDto) {
    return this.prisma.addressBook.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.addressBook.delete({ where: { id } });
  }
}
