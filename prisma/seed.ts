
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
