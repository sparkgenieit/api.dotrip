import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehicleTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.vehicleType.findMany();
  }
}
