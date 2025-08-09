import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function main() {
  const password = await bcrypt.hash('123123', 10);

  // Declare once — avoid redeclarations later
  let vendorUser: { id: number } | null = null;
  let vendor: { id: number } | null = null;

  // ✅ Base users (admin, user, driver, vendor placeholders)
  await prisma.user.createMany({
    data: [
      { name: 'Admin',  email: 'admin@dotrip.net',  password, role: 'ADMIN' },
      { name: 'User',   email: 'user@dotrip.net',   password, role: 'RIDER' },
      { name: 'Driver', email: 'driver@dotrip.net', password, role: 'DRIVER' },
      { name: 'Vendor', email: 'vendor@dotrip.net', password, role: 'VENDOR' },
    ],
    skipDuplicates: true,
  });

  // ✅ Vehicle types (with rate & base fare)
  await prisma.vehicleType.createMany({
    data: [
      { name: 'Sedan',           estimatedRatePerKm: 12, baseFare: 350 },
      { name: 'SUV',             estimatedRatePerKm: 15, baseFare: 500 },
      { name: 'Hatchback',       estimatedRatePerKm: 10, baseFare: 300 },
      { name: 'Tempo Traveller', estimatedRatePerKm: 18, baseFare: 700 },
    ],
    skipDuplicates: true,
  });

  // ✅ Trip types with slugs
  await prisma.tripType.createMany({
    data: [
      { label: 'One Way',          slug: 'one-way' },
      { label: 'Round Trip',       slug: 'round-trip' },
      { label: 'Hourly Rental',    slug: 'hourly-rental' },
      { label: 'Airport Transfer', slug: 'airport-transfer' },
      { label: 'Outstation',       slug: 'outstation' },
      { label: 'Local City',       slug: 'local-city' },
    ],
    skipDuplicates: true,
  });

  // ✅ Top cities from cities.json
  const filePath = path.join(__dirname, 'cities.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const allCities = JSON.parse(rawData) as {
    city: string;
    state: string;
    population: number;
    latitude: number;
    longitude: number;
  }[];

  const topCities = allCities
    .filter((entry) => typeof entry.population === 'number')
    .sort((a, b) => b.population - a.population)
    .slice(0, 100);

  console.log(`🚀 Seeding Top ${topCities.length} Cities...`);
  let cityInserted = 0;
  let citySkipped = 0;

  for (const entry of topCities) {
    try {
      await prisma.city.create({
        data: {
          name: entry.city,
          state: entry.state,
          lat: entry.latitude,
          lng: entry.longitude,
        },
      });
      cityInserted++;
    } catch (err: any) {
      if (typeof err?.message === 'string' && err.message.includes('Unique constraint')) {
        citySkipped++;
      } else {
        console.error(`City insert failed: ${entry.city}, ${entry.state}`, err);
      }
    }
  }

  // ✅ City distances (bidirectional)
  const cities = await prisma.city.findMany({
    select: { id: true, name: true, lat: true, lng: true },
    orderBy: { id: 'asc' },
  });

  console.log(`\n📏 Calculating distances between ${cities.length} cities...`);
  let distanceInserted = 0;
  let distanceSkipped = 0;

  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const from = cities[i];
      const to = cities[j];
      if (from.lat == null || from.lng == null || to.lat == null || to.lng == null) continue;

      const distance = parseFloat(haversine(from.lat, from.lng, to.lat, to.lng).toFixed(2));

      try {
        await prisma.cityDistance.createMany({
          data: [
            { fromCityId: from.id, toCityId: to.id, distanceKm: distance, fromCityName: from.name, toCityName: to.name },
            { fromCityId: to.id,   toCityId: from.id, distanceKm: distance, fromCityName: to.name, toCityName: from.name },
          ],
          skipDuplicates: true,
        });
        distanceInserted += 2;
      } catch {
        distanceSkipped += 2;
      }
    }
  }

  console.log('\n✅ Seeding complete for cities & distances!');
  console.log(`🌆 Cities → Inserted: ${cityInserted}, Skipped: ${citySkipped}`);
  console.log(`📏 Distances → Inserted: ${distanceInserted}, Skipped: ${distanceSkipped}`);

  // ✅ Feedback from existing trips (if any)
  const tripsForFeedback = await prisma.trip.findMany({
    take: 2,
    include: { rider: true, driver: true },
  });

  if (tripsForFeedback.length === 0) {
    console.warn('⚠️ No trips found. Skipping feedback seeding.');
  } else {
    const feedbackSeed = tripsForFeedback.map((trip, i) => ({
      tripId: trip.id,
      riderId: trip.riderId,
      driverId: trip.driverId,
      driverRating: [5, 4][i % 2],
      vehicleRating: [4, 3][i % 2],
      serviceRating: [5, 4][i % 2],
      comment: [
        'Smooth and professional ride!',
        'Decent trip, but car was a bit dusty.',
      ][i % 2],
      feedbackTime: new Date(Date.now() - i * 86400000),
    }));

    for (const entry of feedbackSeed) {
      const existing = await prisma.feedback.findUnique({ where: { tripId: entry.tripId } });
      if (!existing) {
        await prisma.feedback.create({ data: entry });
      }
    }
  }

  // 🧑‍💼 Vendor user (IDEMPOTENT, bcrypt)
  const desiredCompanyReg = 'VND12345';

  vendorUser = await prisma.user.upsert({
    where: { email: 'vendor1@mail.com' },
    update: { name: 'Vendor 1', phone: '9000000000', role: Role.VENDOR, password },
    create: { name: 'Vendor 1', email: 'vendor1@mail.com', phone: '9000000000', role: Role.VENDOR, password },
  });

  // 🧑‍💼 Vendor: schema has no Vendor.email; companyReg & userId are unique-ish.
  // Reuse an existing vendor by userId OR companyReg to avoid unique collisions.
  let vendorRecord = await prisma.vendor.findFirst({
    where: { OR: [{ userId: vendorUser!.id }, { companyReg: desiredCompanyReg }] },
  });

  if (!vendorRecord) {
    vendorRecord = await prisma.vendor.create({
      data: { name: 'Vendor 1', companyReg: desiredCompanyReg, userId: vendorUser!.id },
    });
  } else {
    vendorRecord = await prisma.vendor.update({
      where: { id: vendorRecord.id },
      data: { name: 'Vendor 1', companyReg: desiredCompanyReg, userId: vendorUser!.id },
    });
  }
  vendor = { id: vendorRecord.id };

  // 👤 Riders (5) — idempotent
  const riders = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.user.upsert({
        where: { email: `rider${i + 1}@mail.com` },
        update: { name: `Rider ${i + 1}`, phone: `800000000${i + 1}`, role: Role.RIDER, password },
        create: { name: `Rider ${i + 1}`, email: `rider${i + 1}@mail.com`, phone: `800000000${i + 1}`, role: Role.RIDER, password },
      })
    )
  );

  // 🚗 Drivers (10) — create/attach to vendor (find or create; `userId` is not unique)
  const drivers: { id: number }[] = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.upsert({
      where: { email: `driver${i}@mail.com` },
      update: { name: `Driver ${i}`, phone: `700000000${i}`, role: Role.DRIVER, password },
      create: { name: `Driver ${i}`, email: `driver${i}@mail.com`, phone: `700000000${i}`, role: Role.DRIVER, password },
    });

    // Since Driver.whereUnique doesn't accept userId, do a findFirst + create/update
    const existingDriver = await prisma.driver.findFirst({ where: { userId: user.id } });

    let driverId: number;
    if (!existingDriver) {
      const created = await prisma.driver.create({
        data: {
          userId: user.id,
          fullName: user.name,
          phone: user.phone!,
          email: user.email,
          licenseNumber: `LICDRV${i}2025`,
          licenseExpiry: new Date(`2027-01-${(i % 27) + 2}`),
          licenseImage: `uploads/drivers/license_driver_${i}.jpg`,
          rcImage: `uploads/drivers/rc_driver_${i}.jpg`,
          isPartTime: i % 2 === 0,
          isAvailable: true,
          vendorId: vendor!.id,
        },
      });
      driverId = created.id;
    } else {
      const updated = await prisma.driver.update({
        where: { id: existingDriver.id }, // id is unique
        data: {
          fullName: user.name,
          phone: user.phone!,
          email: user.email,
          licenseNumber: `LICDRV${i}2025`,
          licenseExpiry: new Date(`2027-01-${(i % 27) + 2}`),
          licenseImage: `uploads/drivers/license_driver_${i}.jpg`,
          rcImage: `uploads/drivers/rc_driver_${i}.jpg`,
          isPartTime: i % 2 === 0,
          isAvailable: true,
          vendorId: vendor!.id,
        },
      });
      driverId = updated.id;
    }

    drivers.push({ id: driverId });
  }

  // 🏠 Pickup/Drop addresses for those 5 riders
  const pickupAddresses = await Promise.all(
    riders.map((r, i) =>
      prisma.addressBook.create({
        data: { userId: r.id, address: `Pickup Address ${i + 1}`, type: 'PICKUP' },
      })
    )
  );

  const dropAddresses = await Promise.all(
    riders.map((r, i) =>
      prisma.addressBook.create({
        data: { userId: r.id, address: `Drop Address ${i + 1}`, type: 'DROP' },
      })
    )
  );

  // 📆 Sample bookings (5)
  await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.booking.create({
        data: {
          pickupAddressId: pickupAddresses[i].id,
          dropAddressId: dropAddresses[i].id,
          userId: riders[i].id,
          fromCityId: 1,
          toCityId: 1,
          fare: 12 + i,
          tripTypeId: (i % 2) + 1,
          vehicleTypeId: 1,
          pickupDateTime: new Date(`2025-07-2${i + 1}T08:00:00Z`),
        },
      })
    )
  );

  // 💰 Default price (to satisfy Vehicle.priceId FK)
  const defaultPrice = await prisma.price.upsert({
    where: { id: 1 }, // or use a unique slug if your model has it
    update: {},
    create: { priceType: 'normal', price: 15 },
  });

  // 🚙 Vehicles (10) — linked to vendor + drivers + priceId
  const vt = await prisma.vehicleType.findFirst();
  const vehicleTypeId = vt ? vt.id : (await prisma.vehicleType.create({ data: { name: 'Default Type' } })).id;

  const vehicles = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.vehicle.upsert({
        where: { registrationNumber: `MH12AB12${30 + i}` },
        update: {
          name: `Vehicle ${i + 1}`,
          model: `Model ${i + 1}`,
          vehicleTypeId,
          comfortLevel: (i % 3) + 1,
          capacity: 4,
          price: 15 + i,
          status: 'available',
          vendorId: vendor!.id,
          driverOwnerId: drivers[i].id,
          lastServicedDate: new Date(),
          image: ['uploads/vehicles/sample.jpg'], // JSON array
          createdBy: 'VENDOR',
          priceId: defaultPrice.id,
        },
        create: {
          name: `Vehicle ${i + 1}`,
          model: `Model ${i + 1}`,
          registrationNumber: `MH12AB12${30 + i}`,
          vehicleTypeId,
          comfortLevel: (i % 3) + 1,
          capacity: 4,
          price: 15 + i,
          status: 'available',
          vendorId: vendor!.id,
          driverOwnerId: drivers[i].id,
          lastServicedDate: new Date(),
          image: ['uploads/vehicles/sample.jpg'],
          createdBy: 'VENDOR',
          priceId: defaultPrice.id,
        },
      })
    )
  );

  console.log(`🚙 Vehicles → Upserted: ${vehicles.length}`);
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
