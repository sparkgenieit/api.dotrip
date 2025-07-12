import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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

  // ✅ Seed users
  await prisma.user.createMany({
    data: [
      { name: 'Admin',  email: 'admin@dotrip.net',  password, role: 'ADMIN' },
      { name: 'User',   email: 'user@dotrip.net',   password, role: 'RIDER' },
      { name: 'Driver', email: 'driver@dotrip.net', password, role: 'DRIVER' },
      { name: 'Vendor', email: 'vendor@dotrip.net', password, role: 'VENDOR' }
    ],
    skipDuplicates: true
  });

// ✅ Seed vehicle types with estimatedRatePerKm and baseFare
await prisma.vehicleType.createMany({
  data: [
    {
      name: "Sedan",
      estimatedRatePerKm: 12,
      baseFare: 350,
    },
    {
      name: "SUV",
      estimatedRatePerKm: 15,
      baseFare: 500,
    },
    {
      name: "Hatchback",
      estimatedRatePerKm: 10,
      baseFare: 300,
    },
    {
      name: "Tempo Traveller",
      estimatedRatePerKm: 18,
      baseFare: 700,
    },
  ],
  skipDuplicates: true,
});

  // ✅ Get first vehicle type
  const vehicleTypes = await prisma.vehicleType.findMany();
  const firstVehicleTypeId = vehicleTypes.length > 0
    ? vehicleTypes[0].id
    : (await prisma.vehicleType.create({ data: { name: "Default Type" } })).id;

  // ✅ Seed vehicles
  await prisma.vehicle.createMany({
    data: [
      {
        name: "Innova Crysta",
        model: "2.4 ZX",
        image: "https://example.com/innova.jpg",
        capacity: 7,
        registrationNumber: "TS123456",
        price: 1200,
        originalPrice: 1400,
        comfortLevel: 4,
        vehicleTypeId: firstVehicleTypeId
      },
      {
        name: "Dzire",
        model: "VXI",
        image: "https://example.com/dzire.jpg",
        capacity: 5,
        registrationNumber: "TS654321",
        price: 900,
        originalPrice: 1100,
        comfortLevel: 3,
        vehicleTypeId: firstVehicleTypeId
      }
    ],
    skipDuplicates: true
  });

  // ✅ Seed trip types with slugs
  await prisma.tripType.createMany({
    data: [
      { label: "One Way",          slug: "one-way" },
      { label: "Round Trip",       slug: "round-trip" },
      { label: "Hourly Rental",    slug: "hourly-rental" },
      { label: "Airport Transfer", slug: "airport-transfer" },
      { label: "Outstation",       slug: "outstation" },
      { label: "Local City",       slug: "local-city" }
    ],
    skipDuplicates: true
  });

  // ✅ Seed top cities from cities.json
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
          lng: entry.longitude
        }
      });
      console.log(`✅ Inserted City: ${entry.city}, ${entry.state}`);
      cityInserted++;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        console.warn(`⏭️ Skipping duplicate: ${entry.city}, ${entry.state}`);
        citySkipped++;
      } else {
        console.error(`❌ Failed to insert city: ${entry.city}, ${entry.state}`, error);
      }
    }
  }

  // ✅ Seed city distances (bidirectional)
  const cities = await prisma.city.findMany({
    select: { id: true, name: true, lat: true, lng: true },
    orderBy: { id: 'asc' }
  });

  console.log(`\n📏 Calculating distances between ${cities.length} cities...`);
  let distanceInserted = 0;
  let distanceSkipped = 0;

  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const from = cities[i];
      const to = cities[j];

      if (from.lat == null || from.lng == null || to.lat == null || to.lng == null) {
        continue;
      }

      const distance = parseFloat(haversine(from.lat, from.lng, to.lat, to.lng).toFixed(2));

      try {
        await prisma.cityDistance.createMany({
          data: [
            {
              fromCityId: from.id,
              toCityId: to.id,
              distanceKm: distance,
              fromCityName: from.name,
              toCityName: to.name
            },
            {
              fromCityId: to.id,
              toCityId: from.id,
              distanceKm: distance,
              fromCityName: to.name,
              toCityName: from.name
            }
          ],
          skipDuplicates: true
        });

        console.log(`📍 Inserted: ${from.name} ↔ ${to.name} = ${distance} km`);
        distanceInserted += 2;
      } catch (error) {
        distanceSkipped += 2;
        console.warn(`⏭️ Skipped duplicate or error: ${from.name} ↔ ${to.name}`);
      }
    }
  }

  console.log('\n✅ Seeding complete!');
  console.log(`🌆 Cities → Inserted: ${cityInserted}, Skipped: ${citySkipped}`);
  console.log(`📏 Distances → Inserted: ${distanceInserted}, Skipped: ${distanceSkipped}`);

    // ✅ Seed feedback based on existing trips
  const tripsForFeedback = await prisma.trip.findMany({
    take: 2,
    include: {
      rider: true,
      driver: true
    }
  });

  if (tripsForFeedback.length === 0) {
    console.warn("⚠️ No trips found. Skipping feedback seeding.");
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
      feedbackTime: new Date(Date.now() - i * 86400000)
    }));

    for (const entry of feedbackSeed) {
      const existing = await prisma.feedback.findUnique({
        where: { tripId: entry.tripId }
      });

      if (!existing) {
        await prisma.feedback.create({ data: entry });
        console.log(`📝 Feedback seeded for tripId ${entry.tripId}`);
      } else {
        console.log(`⏭️ Feedback already exists for tripId ${entry.tripId}`);
      }
    }
  }

}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
