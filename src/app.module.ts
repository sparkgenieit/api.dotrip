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
import { BookingModule } from './bookings/booking.module';
import { CorporateBookingModule } from './corporate-bookings/corporate-booking.module';

import { PlacesModule } from './places/places.module';
import { VehicleTypesModule } from './vehicle-types/vehicle-types.module';
import { AdminModule } from './admin/admin.module';

import { DriverModule } from './drivers/driver.module';
import { TripsModule } from './trips/trips.module';
import { FeedbackModule } from './feedback/feedback.module';
import { QuotesModule } from './quotes/quotes.module';

import { GlobalModule } from './global.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module'; // ✅ NEW: WhatsApp module
import { InvoiceModule } from './invoice/invoice.module'; // ✅ NEW: Import Feedback Module
import { DriverUpdatesModule } from './DriverUpdate/driver-updates.module'; // ✅ Adjust path if needed

import { JwtAuthGuard } from './auth/jwt-auth.guard';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AddressBookModule,
    VehiclesModule,
    CitiesModule,
    TripTypesModule,
    BookingModule,
    PlacesModule,
    AdminModule,
    VehicleTypesModule,
    CorporateBookingModule,
    TripsModule,
    DriverModule,
    FeedbackModule,
    QuotesModule,
      GlobalModule,   // ✅ Register global email
    WhatsAppModule,      // ✅ Register WhatsApp messaging
     InvoiceModule,
     DriverUpdatesModule,
  ],
  providers: [],
})
export class AppModule {}
