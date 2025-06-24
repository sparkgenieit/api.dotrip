import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateVendorDto) {
    return this.prisma.vendor.create({ data });
  }

  findAll() {
    return this.prisma.vendor.findMany();
  }

  async findOne(id: number) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  update(id: number, data: UpdateVendorDto) {
    return this.prisma.vendor.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.vendor.delete({ where: { id } });
  }
}