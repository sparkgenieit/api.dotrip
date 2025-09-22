import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

 async create(
    dto: any,
    actor?: { id: number; role?: string; phone?: string }
  ) {
    const {
      // phone will be resolved below based on role
      pickupLocation,
      dropoffLocation,

      // split fields
      pickupDate,   // "YYYY-MM-DD"
      pickupTime,   // "HH:mm"
      returnDate,   // optional "YYYY-MM-DD"
      returnTime,   // optional "HH:mm"

      fromCityId,
      toCityId,
      tripTypeId,
      vehicleTypeId,
      fare,
      numPersons = 1,
      numVehicles = 1,
    } = dto;

    const role = (actor?.role || '').toUpperCase();
    const phoneToUse =
      role === 'RIDER'
        ? actor?.phone // force RIDER to use token phone
        : dto.phone;   // ADMIN/VENDOR must provide phone in body

    if (!phoneToUse) {
      throw new BadRequestException(
        role === 'RIDER'
          ? 'Authenticated rider has no phone in token'
          : 'phone is required in body for ADMIN/VENDOR'
      );
    }

    const user = await this.prisma.user.findFirst({ where: { phone: phoneToUse } });
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

    const pad2 = (v: string | number) => String(v).padStart(2, '0');
    const toTimeDate = (hhmm: string) => {
      const [h = '00', m = '00'] = (hhmm || '').split(':');
      return new Date(`1970-01-01T${pad2(+h)}:${pad2(+m)}:00.000Z`);
    };
    const toDateOnly = (d?: string | null) =>
      d ? new Date(`${d}T00:00:00.000Z`) : null;

    return this.prisma.booking.create({
      data: {
        userId: user.id,
        vehicleTypeId,
        pickupAddressId: pickupAddress.id,
        dropAddressId: dropAddress.id,

        pickupDate: toDateOnly(pickupDate)!,          // required
        pickupTime: toTimeDate(pickupTime),           // required

        returnDate: toDateOnly(returnDate),
        returnTime: returnTime ? toTimeDate(returnTime) : null,

        fromCityId,
        toCityId,
        tripTypeId,
        fare,
        numPersons,
        numVehicles,
        status: 'PENDING',
      },
    });
  }

async findAll(user?: { id: number; role?: string }) {
  let where: Prisma.BookingWhereInput | undefined;

  // If the caller is a VENDOR, limit to their bookings
  if (user?.role?.toUpperCase() === 'VENDOR') {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) {
      throw new NotFoundException('Vendor not found for the current user');
    }
    where = { vendorId: vendor.id };
  }

  return this.prisma.booking.findMany({
    where,
    include: {
      user: true,
      vehicleType: true,
      pickupAddress: true,
      dropAddress: true,
      fromCity: true,
      toCity: true,
      TripType: true,
      quotes: { where: { approved: true }, select: { id: true } },
      trips: true,
    },
    orderBy: { id: 'desc' }, // optional
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

async update(id: number, data: any) {
  // optional: ensure record exists
  await this.findOne(id);

  const {
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    ...rest
  } = data ?? {};

  const pad2 = (v: string | number) => String(v).padStart(2, '0');
  const toTimeDate = (hhmm: string) => {
    const [h = '00', m = '00'] = (hhmm || '').split(':');
    return new Date(`1970-01-01T${pad2(+h)}:${pad2(+m)}:00.000Z`);
  };
  const toDateOnly = (d?: string | null) =>
    d ? new Date(`${d}T00:00:00.000Z`) : null;

  return this.prisma.booking.update({
    where: { id },
    data: {
      ...rest,
      ...(pickupDate !== undefined && { pickupDate: toDateOnly(pickupDate) }),
      ...(pickupTime !== undefined && { pickupTime: toTimeDate(pickupTime) }),
      ...(returnDate !== undefined && { returnDate: toDateOnly(returnDate) }),
      ...(returnTime !== undefined && {
        returnTime: returnTime ? toTimeDate(returnTime) : null,
      }),
    },
  });
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

  async markAsConfirmedIfTripsExist(bookingId: number) {
  const booking = await this.prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trips: true },
  });

  if (booking && booking.trips.length > 0 && booking.status === 'PENDING') {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });
  }

  return booking;
}

}



