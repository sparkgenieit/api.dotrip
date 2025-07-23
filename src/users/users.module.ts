import { Module, forwardRef } from '@nestjs/common';
import { UsersService }      from './users.service';
import { UsersController }   from './users.controller';
import { PrismaModule }      from '../prisma/prisma.module';
import { BookingModule }    from '../bookings/booking.module';



@Module({
  imports: [
    PrismaModule,
    forwardRef(() => BookingModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
