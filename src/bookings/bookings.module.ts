import { Module, forwardRef } from '@nestjs/common';
import { BookingsService }    from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule }      from '../prisma/prisma.module';
import { UsersModule }       from '../users/users.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UsersModule),
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
