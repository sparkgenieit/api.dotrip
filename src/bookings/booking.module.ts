import { Module, forwardRef } from '@nestjs/common';
import { BookingService }    from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule }      from '../prisma/prisma.module';
import { UsersModule }       from '../users/users.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UsersModule),
  ],
  providers: [BookingService],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
