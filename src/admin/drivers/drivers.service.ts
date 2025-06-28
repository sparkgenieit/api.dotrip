import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

create(dto: CreateDriverDto) {
  const { vehicleId, ...rest } = dto;
  return this.prisma.driver.create({
    data: {
      ...rest,
      vehicleId: vehicleId ?? undefined,
    },
  });
}

  findAll() {
    return this.prisma.driver.findMany();
  }

  findOne(id: string) {
    return this.prisma.driver.findUnique({
      where: { id: parseInt(id) },
    });
  }

update(id: string, dto: UpdateDriverDto) {
  const { vehicleId, ...rest } = dto;
  return this.prisma.driver.update({
    where: { id: parseInt(id) },
    data: {
      ...rest,
      vehicleId: vehicleId ?? undefined,
    },
  });
}

  remove(id: string) {
    return this.prisma.driver.delete({
      where: { id: parseInt(id) },
    });
  }
}
