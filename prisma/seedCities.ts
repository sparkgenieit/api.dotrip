import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'cities.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');

  const allCities = JSON.parse(rawData) as {
    city: string;
    state: string;
    population: number;
    latitude: number;
    longitude: number;
  }[];

  // ✅ Sort by population descending and select top 100
  const topCities = allCities
    .filter((entry) => typeof entry.population === 'number')
    .sort((a, b) => b.population - a.population)
    .slice(0, 100);

  console.log(`🚀 Seeding Top ${topCities.length} Populous Cities...\n`);

  let inserted = 0;
  let skipped = 0;

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
      console.log(`✅ Inserted: ${entry.city}, ${entry.state}`);
      inserted++;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Unique constraint')
      ) {
        console.warn(`⏭️ Skipping duplicate: ${entry.city}, ${entry.state}`);
        skipped++;
      } else {
        console.error(`❌ Failed to insert: ${entry.city}, ${entry.state}`, error);
      }
    }
  }

  console.log(`\n🌍 City seeding completed!`);
  console.log(`✅ Total inserted: ${inserted}`);
  console.log(`⏭️ Total skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
