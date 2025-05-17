import { Module } from '@nestjs/common';
import { AddressBookService } from './address-book.service';
import { AddressBookController } from './address-book.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AddressBookController],
  providers: [AddressBookService],
})
export class AddressBookModule {}
