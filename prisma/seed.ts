// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Upsert Admin
  const adminPass = await bcrypt.hash('123123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@dotrip.net' },
    update: { password: adminPass, role: 'ADMIN', updatedAt: new Date() },
    create: {
      id:        4,
      name:      'Admin',
      email:     'admin@dotrip.net',
      password:  adminPass,
      phone:     null,
      role:      'ADMIN',
      createdAt: new Date('2025-05-09T20:09:30.366Z'),
      updatedAt: new Date('2025-05-09T20:09:30.366Z'),
    },
  });

  // 2. Upsert Rider
  const riderPass = await bcrypt.hash('123123', 10);
  await prisma.user.upsert({
    where: { email: 'user@dotrip.net' },
    update: { password: riderPass, role: 'RIDER', updatedAt: new Date() },
    create: {
      id:        5,
      name:      'User',
      email:     'user@dotrip.net',
      password:  riderPass,
      phone:     null,
      role:      'RIDER',
      createdAt: new Date('2025-05-09T20:10:07.580Z'),
      updatedAt: new Date('2025-05-09T20:10:07.580Z'),
    },
  });

  

  // 3. Upsert the Vendor-role user
  const vendorPass = await bcrypt.hash('123123', 10);
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@dotrip.net' },
    update: {
      password: vendorPass,
      role: 'VENDOR',
      updatedAt: new Date(),
    },
    create: {
      name: 'Vendor User',
      email: 'vendor@dotrip.net',
      password: vendorPass,
      phone: null,
      role: 'VENDOR',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 4. Create the Vendor record linked to vendor user
   let vendor = await prisma.vendor.findFirst({
    where: { companyReg: 'VEND-001' },
  });

  if (!vendor) {
    vendor = await prisma.vendor.create({
      data: {
        name: 'Test Vendor Co.',
        companyReg: 'VEND-001',
        createdAt: new Date(),
        vendor: { connect: { id: vendorUser.id } },
      },
    });

    // Also update user with vendorId
    await prisma.user.update({
      where: { id: vendorUser.id },
      data: { vendorId: vendor.id },
    });
  }

  // 5. Seed top 20 Indian cities
  const cities = [
    { name: 'Mumbai',           state: 'Maharashtra' },
    { name: 'Delhi',            state: 'Delhi' },
    { name: 'Bengaluru',        state: 'Karnataka' },
    { name: 'Hyderabad',        state: 'Telangana' },
    { name: 'Ahmedabad',        state: 'Gujarat' },
    { name: 'Chennai',          state: 'Tamil Nadu' },
    { name: 'Kolkata',          state: 'West Bengal' },
    { name: 'Surat',            state: 'Gujarat' },
    { name: 'Pune',             state: 'Maharashtra' },
    { name: 'Jaipur',           state: 'Rajasthan' },
    { name: 'Lucknow',          state: 'Uttar Pradesh' },
    { name: 'Kanpur',           state: 'Uttar Pradesh' },
    { name: 'Nagpur',           state: 'Maharashtra' },
    { name: 'Indore',           state: 'Madhya Pradesh' },
    { name: 'Thane',            state: 'Maharashtra' },
    { name: 'Bhopal',           state: 'Madhya Pradesh' },
    { name: 'Visakhapatnam',    state: 'Andhra Pradesh' },
    { name: 'Pimpri-Chinchwad', state: 'Maharashtra' },
    { name: 'Patna',            state: 'Bihar' },
    { name: 'Vadodara',         state: 'Gujarat' },
  ];

  for (const city of cities) {
    const exists = await prisma.city.findFirst({
      where: { name: city.name, state: city.state }
    });

    if (!exists) {
      await prisma.city.create({
        data: city
      });
    }
  }

    // 6. Seed sample vehicles
  const vehicles = [
    {
      name:          'Toyota Innova',
      model:         'Crysta',
      image:         'https://example.com/images/innova.jpg',
      capacity:      7,
      price:         1200,
      originalPrice: 1500,
      registrationNumber:'TS091234'
    },
    {
      name:          'Maruti Suzuki Dzire',
      model:         'VXI',
      image:         'https://example.com/images/dzire.jpg',
      capacity:      5,
      price:         800,
      originalPrice: 1000,
            registrationNumber:'TS091235'

    },
    {
      name:          'Mahindra Scorpio',
      model:         'S11',
      image:         'https://example.com/images/scorpio.jpg',
      capacity:      7,
      price:         1500,
      originalPrice: 1800,
            registrationNumber:'TS091236'

    },
    {
      name:          'Honda City',
      model:         'ZX CVT',
      image:         'https://example.com/images/city.jpg',
      capacity:      5,
      price:         1000,
      originalPrice: 1300,
            registrationNumber:'TS091237'

    },
    {
      name:          'Ford Endeavour',
      model:         'XLT',
      image:         'https://example.com/images/endeavour.jpg',
      capacity:      7,
      price:         1700,
      originalPrice: 2000,
            registrationNumber:'TS091238'

    },
  ];

  for (const v of vehicles) {
    const exists = await prisma.vehicle.findFirst({
      where: { name: v.name, model: v.model },
    });

    if (!exists) {
      await prisma.vehicle.create({
        data: {
          ...v,
         vendor:    { connect: { id: 6 } },
          createdAt: new Date(),
        },
      });
    }
  }
  // 7. Upsert Driver user + Driver record
  const driverPass = await bcrypt.hash('123123', 10);
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@dotrip.net' },
    update: {
      password:  driverPass,
      role:      'DRIVER',
      vendorId:  vendor.id,
      updatedAt: new Date(),
    },
    create: {
      name:      'Driver User',
      email:     'driver@dotrip.net',
      password:  driverPass,
      phone:     null,
      role:      'DRIVER',
      vendor:    { connect: { id: vendor.id } },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      name:      driverUser.name,
      license:   'ABCD1234',              // dummy license—change as needed
      user:      { connect: { id: driverUser.id } },
      vendor:    { connect: { id: vendor.id } },
      createdAt: new Date(),
    },
  });

  console.log('✅ Seed complete');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
