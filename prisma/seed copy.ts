import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Master Data
  const [city1, city2] = await Promise.all([
    prisma.city.create({
      data: { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
    }),
    prisma.city.create({
      data: { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    }),
  ]);

  await prisma.cityDistance.create({
    data: {
      fromCityId: city1.id,
      toCityId: city2.id,
      distanceKm: 570,
      fromCityName: city1.name,
      toCityName: city2.name,
    },
  });

  const vehicleType = await prisma.vehicleType.create({
    data: { name: 'SUV', estimatedRatePerKm: 12, baseFare: 100, seatingCapacity: 6 },
  });

  const tripType = await prisma.tripType.create({
    data: { label: 'One Way', slug: 'one-way' },
  });

  const price = await prisma.price.create({
    data: { priceType: 'normal', price: 15.5 },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'securepassword',
      role: 'SUPER_ADMIN',
    },
  });

  const [vendor1, vendor2] = await Promise.all([
    prisma.vendor.create({
      data: {
        name: 'Skyline Travels',
        companyReg: 'SKY001',
        vendor: { connect: { id: admin.id } },
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'City Riders',
        companyReg: 'CITY002',
        vendor: { connect: { id: admin.id } },
      },
    }),
  ]);

  // Create 10 Vehicles (5 each for 2 vendors)
  const vehicles = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.vehicle.create({
        data: {
          name: `Vehicle ${i + 1}`,
          model: `Model ${i + 1}`,
          image: 'https://via.placeholder.com/150',
          capacity: 4 + (i % 3),
          registrationNumber: `KA01AB12${i + 10}`,
          price: 2000 + i * 100,
          originalPrice: 2200 + i * 100,
          status: 'available',
          comfortLevel: (i % 5) + 1,
          lastServicedDate: new Date(),
          vehicleTypeId: vehicleType.id,
          vendorId: i < 5 ? vendor1.id : vendor2.id,
          priceId: price.id,
          createdBy: Role.VENDOR,
        },
      })
    )
  );

  // Create 5 Drivers
  const drivers = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.driver.create({
        data: {
          fullName: `Driver ${i + 1}`,
          phone: `98765432${i + 10}`,
          email: `driver${i + 1}@mail.com`,
          licenseNumber: `LIC00${i + 1}`,
          licenseExpiry: new Date('2030-12-31'),
          isPartTime: i % 2 === 0,
          isAvailable: true,
          vendorId: i < 3 ? vendor1.id : vendor2.id,
        },
      })
    )
  );

  // Create Rider (User) and AddressBook entries
  const rider = await prisma.user.create({
    data: {
      name: 'Test Rider',
      email: 'rider@example.com',
      password: 'riderpass',
      role: 'RIDER',
      phone: '9000011111',
    },
  });

  const pickupAddress = await prisma.addressBook.create({
    data: {
      userId: rider.id,
      type: 'PICKUP',
      address: '123 MG Road',
      city: 'Hyderabad',
      pinCode: '500001',
    },
  });

  const dropAddress = await prisma.addressBook.create({
    data: {
      userId: rider.id,
      type: 'DROP',
      address: '456 Brigade Road',
      city: 'Bangalore',
      pinCode: '560001',
    },
  });

  // Create Booking
  const booking = await prisma.booking.create({
    data: {
      userId: rider.id,
      vehicleTypeId: vehicleType.id,
      pickupAddressId: pickupAddress.id,
      dropAddressId: dropAddress.id,
      pickupDateTime: new Date(Date.now() + 86400000),
      fromCityId: city1.id,
      toCityId: city2.id,
      tripTypeId: tripType.id,
      fare: 7500,
      numPersons: 2,
      numVehicles: 1,
      bookingType: 'individual',
      status: 'PENDING',
    },
  });

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
