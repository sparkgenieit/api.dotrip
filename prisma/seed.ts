
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123123', 10);

  await prisma.user.createMany({
    data: [
      { name: 'Admin',  email: 'admin@dotrip.net',  password, role: 'ADMIN' },
      { name: 'User',   email: 'user@dotrip.net',   password, role: 'RIDER' },
      { name: 'Driver', email: 'driver@dotrip.net', password, role: 'DRIVER' }
    ],
    skipDuplicates: true
  });

  
  await prisma.vehicleType.createMany({
    data: [
      { name: "Sedan" },
      { name: "SUV" },
      { name: "Hatchback" },
      { name: "Tempo Traveller" }
    ]
  });

  const vehicleTypes = await prisma.vehicleType.findMany();
  const firstVehicleTypeId = vehicleTypes.length > 0 ? vehicleTypes[0].id : (
    await prisma.vehicleType.create({ data: { name: "Default Type" } })
  ).id;

  await prisma.city.createMany({
    data: [
      { name: 'Hyderabad', state: 'Telangana' },
      { name: 'Bengaluru', state: 'Karnataka' },
      { name: 'Chennai',   state: 'Tamil Nadu' }
    ],
    skipDuplicates: true
  });

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
        vehicleTypeId: firstVehicleTypeId
      }
    ],
    skipDuplicates: true
  });

  await prisma.tripType.createMany({
    data: [
      { label: "One Way" },
      { label: "Round Trip" },
      { label: "Hourly Rental" }
    ],
    skipDuplicates: true
  });

  console.log("✅ Seed complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
