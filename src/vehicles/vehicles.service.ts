import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateVehicleDto) { return this.prisma.vehicle.create({ data: dto }); }
  findAll() { return this.prisma.vehicle.findMany(); }
  findOne(id: number) { return this.prisma.vehicle.findUnique({ where: { id } }); }
  update(id: number, dto: UpdateVehicleDto) { return this.prisma.vehicle.update({ where: { id }, data: dto }); }
  remove(id: number) { return this.prisma.vehicle.delete({ where: { id } }); }
}
