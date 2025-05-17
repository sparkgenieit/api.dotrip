import { Module, forwardRef } from '@nestjs/common';
import { UsersService }      from './users.service';
import { UsersController }   from './users.controller';
import { PrismaModule }      from '../prisma/prisma.module';
import { BookingsModule }    from '../bookings/bookings.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => BookingsModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
