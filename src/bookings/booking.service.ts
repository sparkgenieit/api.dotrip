import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Prisma } from '@prisma/client';

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
      returnDate,
      // possible aliases coming from clients:
      noOfPersons,
      personsCount,
    } = dto;

    // normalize numbers with min=1
    const toIntMin1 = (v: any, def = 1) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 1 ? Math.floor(n) : def;
    };

    const numPersons = toIntMin1(dto?.numPersons ?? noOfPersons ?? personsCount, 1);
    const numVehicles = toIntMin1(dto?.numVehicles, 1);
    const fareNum = Number(fare ?? 0) || 0;


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
            vehicleTypeId: Number(vehicleTypeId),
            pickupAddressId: pickupAddress.id,
            dropAddressId: dropAddress.id,
            pickupDateTime: new Date(pickupDateTime),

            // store date-only as midnight UTC (avoids TZ drift)
            returnDate: returnDate ? new Date(`${returnDate}T00:00:00.000Z`) : null,

            fromCityId: Number(fromCityId),
            toCityId: Number(toCityId),
            tripTypeId: Number(tripTypeId),

            // normalized numbers
            fare: fareNum,
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

  async update(id: number, data: UpdateBookingDto) {
  await this.findOne(id);

  const {
    returnDate,
    numPersons: np,
    numVehicles: nv,
    noOfPersons,
    personsCount,
    fare,
    ...rest
  } = data as any;

  const toIntMin1 = (v: any, def = 1) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : def;
  };

  const updateData: any = {
    ...rest,
  };

  // only set when supplied
  if (returnDate !== undefined) {
    updateData.returnDate = returnDate
      ? new Date(`${returnDate}T00:00:00.000Z`)
      : null;
  }

  const personsU = np ?? noOfPersons ?? personsCount;
  if (personsU !== undefined) {
    updateData.numPersons = toIntMin1(personsU, 1);
  }

  if (nv !== undefined) {
    updateData.numVehicles = toIntMin1(nv, 1);
  }

  if (fare !== undefined) {
    updateData.fare = Number(fare) || 0;
  }

  return this.prisma.booking.update({
    where: { id },
    data: updateData,
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
