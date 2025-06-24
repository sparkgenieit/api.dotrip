import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EarningsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.earnings.findMany();
  }
}