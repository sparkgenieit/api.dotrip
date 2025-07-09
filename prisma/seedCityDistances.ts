// prisma/seedCityDistances.ts
import { PrismaClient } from '@prisma/client';

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
  const cities = await prisma.city.findMany({
    select: {
      id: true,
      name: true,
      lat: true,
      lng: true,
    },
    orderBy: { id: 'asc' },
  });

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const from = cities[i];
      const to = cities[j];

      // skip if lat/lng are null
      if (from.lat == null || from.lng == null || to.lat == null || to.lng == null) {
        continue;
      }

      const distance = haversine(from.lat, from.lng, to.lat, to.lng);

      try {
          await prisma.cityDistance.create({
            data: {
              fromCityId: from.id,
              toCityId: to.id,
              distanceKm: parseFloat(distance.toFixed(2)),
              fromCityName: from.name,    // ✅ Add name fields
              toCityName: to.name,
            },
          });

        // Insert reverse (to → from) as well
       await prisma.cityDistance.create({
        data: {
          fromCityId: to.id,
          toCityId: from.id,
          distanceKm: parseFloat(distance.toFixed(2)),
          fromCityName: to.name,
          toCityName: from.name,
        },
      });

        inserted += 2;
        console.log(`Inserted: ${from.name} <-> ${to.name} = ${distance.toFixed(2)} km`);
      } catch (error) {
        skipped += 2;
        console.warn(`Skipped duplicate or Error:${error} ${from.name} <-> ${to.name}`);
      }
    }
  }

  console.log('\n🌍 Distance seeding complete');
  console.log(`✅ Total inserted: ${inserted}`);
  console.log(`⏭️ Total skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
