import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 🧑‍💼 Create Vendor User + Vendor
  const vendorUser = await prisma.user.create({
    data: {
      name: 'Vendor 1',
      email: 'vendor1@mail.com',
      phone: '9000000000',
      role: Role.VENDOR,
      password: 'hashedpass',
    },
  });

  const vendor = await prisma.vendor.create({
    data: {
      userId: 4,
      name: 'Vendor 1',
      companyReg: 'VND12345',
    },
  });

  // 🚗 Seed 10 Drivers + Users
  const drivers = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.driver.create({
        data: {
          user: {
            create: {
              name: `Driver ${i + 1}`,
              email: `driver${i + 1}@mail.com`,
              phone: `700000000${i + 1}`,
              role: Role.DRIVER,
              password: 'hashedpass',
            },
          },
           fullName: `Driver ${i + 1}`,
    phone: `700000000${i + 1}`,
    email: `driver${i + 1}@mail.com`,
          licenseNumber: `LICDRV${i + 1}2025`,
          licenseExpiry: new Date(`2027-01-${i + 2}`),
          licenseImage: `uploads/drivers/license_driver_${i + 1}.jpg`,
          rcImage: `uploads/drivers/rc_driver_${i + 1}.jpg`,
          isPartTime: i % 2 === 0,
          isAvailable: true,
          vendor: { connect: { id: vendor.id } },
        },
        include: { user: true },
      })
    )
  );

  // 🚙 Seed 10 Vehicles (assign to vendor & driver)
  const vehicles = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.vehicle.create({
        data: {
          name: `Car ${i + 1}`,
          registrationNumber: `MH12AB12${30 + i}`,
          model: `202${i % 3}`,
          vehicleTypeId: 1,
          comfortLevel: (i % 3) + 1,
          capacity: 4,
          price: 15 + i,
          status: 'available',
          vendorId: vendor.id,
          driverOwnerId: drivers[i].id,
          lastServicedDate: new Date(),
          image: ['uploads/vehicles/sample.jpg'],
          createdBy: 'VENDOR',
        },
      })
    )
  );

  // 👤 Seed 5 Rider Users
  const riders = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Rider ${i + 1}`,
          email: `rider${i + 1}@mail.com`,
          phone: `800000000${i + 1}`,
          role: Role.RIDER,
          password: 'hashedpass',
        },
      })
    )
  );

  // 🏠 Create Pickup/Drop Addresses
  const pickupAddresses = await Promise.all(
    riders.map((rider, i) =>
      prisma.addressBook.create({
        data: {
          userId: rider.id,
          address: `Pickup Address ${i + 1}`,
          type: 'PICKUP',
        },
      })
    )
  );

  const dropAddresses = await Promise.all(
    riders.map((rider, i) =>
      prisma.addressBook.create({
        data: {
          userId: rider.id,
          address: `Drop Address ${i + 1}`,
          type: 'DROP',
        },
      })
    )
  );

  // 📆 Create Bookings
  await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.booking.create({
       data: {
    pickupAddressId: pickupAddresses[i].id,
    dropAddressId: dropAddresses[i].id,
    userId: riders[i].id,
    fromCityId:1,
  toCityId      :1,
    fare: 12 + i,
    
   
    tripTypeId: (i % 2) + 1,
    vehicleTypeId: 1, // ✅ Required
    pickupDateTime: new Date(`2025-07-2${i + 1}T08:00:00Z`), // ✅ Required
  },
      })
    )
  );

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
