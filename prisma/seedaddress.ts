import { PrismaClient, AddressType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error('❌ No user found. Please seed a user before seeding AddressBook.');
  }

  const addresses: {
    type: AddressType;
    address: string;
    city: string;
    pinCode: string;
  }[] = [
    {
      type: AddressType.HOME,
      address: '123 Home Street',
      city: 'Hyderabad',
      pinCode: '500001',
    },
    {
      type: AddressType.OFFICE,
      address: '789 Work Towers',
      city: 'Hyderabad',
      pinCode: '500002',
    },
    {
      type: AddressType.PICKUP,
      address: 'Miyapur Metro',
      city: 'Hyderabad',
      pinCode: '500003',
    },
    {
      type: AddressType.DROP,
      address: 'RGIA Airport Gate 3',
      city: 'Hyderabad',
      pinCode: '500004',
    },
    {
      type: AddressType.OTHER,
      address: 'Friend’s House Banjara Hills',
      city: 'Hyderabad',
      pinCode: '500005',
    },
  ];

  for (const data of addresses) {
    await prisma.addressBook.upsert({
      where: {
        userId_type_address: {
          userId: user.id,
          type: data.type,
          address: data.address,
        },
      },
      update: {}, // no changes on duplicate
      create: {
        userId: user.id,
        type: data.type,
        address: data.address,
        city: data.city,
        pinCode: data.pinCode,
      },
    });
  }

  console.log(`✅ AddressBook seed complete for user ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
