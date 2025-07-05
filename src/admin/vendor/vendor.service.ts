import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';


@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

async create(data: CreateVendorDto) {
  try {
    return await this.prisma.vendor.create({
      data: {
        name: data.name,
        companyReg: data.companyReg,
        vendorId: data.vendorId,
      },
      select: {
      id: true,
      name: true,
      companyReg: true,
      vendorId: true,
      }
    });
  } catch (error) {
    if (error.code === 'P2002' && Array.isArray(error.meta?.target)) {
      if (error.meta.target.includes('companyReg')) {
        throw new ConflictException('A vendor with this companyReg already exists.');
      }
      if (error.meta.target.includes('vendorId')) {
        throw new ConflictException('A vendor with this vendorId already exists.');
      }
    }
    throw error;
  }
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