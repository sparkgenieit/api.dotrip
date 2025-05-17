import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AddressBookModule } from './users/address-book/address-book.module';


import { VehiclesModule } from './vehicles/vehicles.module';
import { CitiesModule } from './cities/cities.module';
import { TripTypesModule } from './trip-types/trip-types.module';
import { BookingsModule } from './bookings/bookings.module';
import { PlacesModule } from './places/places.module';

import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    CitiesModule,
    TripTypesModule,
    BookingsModule,
    PlacesModule,
    AddressBookModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
