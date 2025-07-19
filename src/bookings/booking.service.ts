import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    const {
      phone,
      pickupLocation,
      dropoffLocation,
      pickupDateTime,
      fromCityId,
      toCityId,
      tripTypeId,
      vehicleTypeId,
      fare,
      numPersons   = 1,            // ✅ new ‑ default 1
      numVehicles  = 1,            // ✅ new ‑ default 1
    } = dto;

    const user = await this.prisma.user.findFirst({ where: { phone } });
    if (!user) throw new NotFoundException('User not found');

    const pickupAddress = await this.prisma.addressBook.upsert({
      where: {
        userId_type_address: {
          userId: user.id,
          type: 'PICKUP',
          address: pickupLocation,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: 'PICKUP',
        address: pickupLocation,
      },
    });

    const dropAddress = await this.prisma.addressBook.upsert({
      where: {
        userId_type_address: {
          userId: user.id,
          type: 'DROP',
          address: dropoffLocation,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: 'DROP',
        address: dropoffLocation,
      },
    });

    return this.prisma.booking.create({
      data: {
        userId: user.id,
        vehicleTypeId,
        pickupAddressId: pickupAddress.id,
        dropAddressId: dropAddress.id,
        pickupDateTime: new Date(pickupDateTime),
        fromCityId,
        toCityId,
        tripTypeId,
        fare,
        numPersons,     // ✅ now saved
        numVehicles,    // ✅ now saved
        status: 'PENDING',
      },
    });
  }

  findAll() {
    return this.prisma.booking.findMany({
      include: {
        user: true,
        vehicleType: true,
        pickupAddress: true,
        dropAddress: true,
        fromCity: true,
        toCity: true,
        TripType: true,
        quotes: {
        where: { approved: true },
        select: { id: true },
      },
      trips: true, // ✅ Include assigned trips here
      },
    });
  }

  findOne(id: number) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        vehicleType: true,
        pickupAddress: true,
        dropAddress: true,
        fromCity: true,
        toCity: true,
        TripType: true,
        quotes: {
        where: { approved: true },
        select: { id: true },
      },
      trips: true, // ✅ Include assigned trips here
      },
    });
  }

  async update(id: number, data: UpdateBookingDto) {
    await this.findOne(id);
    return this.prisma.booking.update({ where: { id }, data });
  }

async getAssignableVehicles(vehicleTypeId: number, user: { id: number; role: string }) {
  let vendorId: number | undefined;

  if (user.role === 'VENDOR') {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!vendor) throw new NotFoundException('Vendor not found for user');
    vendorId = vendor.id;
  }

  return this.prisma.vehicle.findMany({
    where: {
      vehicleTypeId,
      status: 'available',
      ...(vendorId ? { vendorId } : {}), // ✅ filter by vendorId if it's a vendor
    },
    include: {
      driver: {
        include: { user: true },
      },
    },
  });
}

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.booking.delete({ where: { id } });
  }
}
